import { FALLBACK_ADDRESS } from '@hatsprotocol/sdk-v1-core';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { AppHat, HatWearer, SupportedChains } from 'types';
import { checkAddressIsContract } from 'utils';
import { Hex, zeroAddress } from 'viem';
import { fetchEnsName } from 'wagmi/actions';

const fetchWearerDetails = async (wearer: Hex, chainId: number | undefined) => {
  if (!wearer || !chainId) return null;
  const defaultWearer = { id: wearer, isContract: false, ensName: '' };

  if (wearer === FALLBACK_ADDRESS || wearer === zeroAddress) {
    return Promise.resolve(defaultWearer);
  }

  return Promise.all([
    checkAddressIsContract(wearer, chainId),
    fetchEnsName({
      address: wearer,
      chainId: 1,
    }),
  ])
    .then((data) => {
      if (!data) return defaultWearer;

      const [isContract, ensName] = data as [boolean, string];

      return Promise.resolve({
        id: wearer,
        isContract,
        ensName: ensName || '',
      });
    })
    .catch(async (err) => {
      // eslint-disable-next-line no-console
      console.log(err);
      return Promise.resolve(defaultWearer);
    });
};

const fetchTreeWearersDetails = async (
  hats: AppHat[] | undefined,
  chainId: number | undefined,
) => {
  if (!hats || !chainId) return [];
  // Trying to be very methodical about when we need to fetch data
  // for batches of wearers as these can grow quickly across a tree
  const wearersList: HatWearer[] = [];
  // check if hat has multiple wearers (groups are not checked)
  _.forEach(hats, (hat: AppHat) => {
    if (_.size(hat.wearers) === 1) {
      wearersList.push(_.first(hat.wearers));
    }
    if (hat.eligibility && hat.eligibility !== FALLBACK_ADDRESS) {
      wearersList.push({ id: hat.eligibility });
    }
    if (hat.toggle && hat.toggle !== FALLBACK_ADDRESS) {
      wearersList.push({ id: hat.toggle });
    }
  });

  // fetch data for solo wearers, return data as is
  const promises = _.map(_.uniqBy(wearersList, 'id'), (wearer: HatWearer) =>
    fetchWearerDetails(wearer.id, chainId),
  );
  const wearerData = await Promise.all(promises);
  return wearerData;
};

const useTreeWearers = ({
  hats,
  chainId,
  editMode = false,
}: {
  hats: AppHat[] | undefined;
  chainId: SupportedChains | undefined;
  editMode?: boolean;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['treeWearers', _.map(hats, 'id'), chainId],
    queryFn: () => fetchTreeWearersDetails(hats, chainId),
    staleTime: editMode ? Infinity : 15 * 1000 * 60,
  });

  return { data, isLoading, error };
};

export default useTreeWearers;
