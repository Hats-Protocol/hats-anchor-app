import { useQueries } from '@tanstack/react-query';
import { fetchEnsName } from '@wagmi/core';
import _ from 'lodash';
import { Hex, isAddress } from 'viem';

import { FALLBACK_ADDRESS, ZERO_ADDRESS } from '@/utils/constants';
import { checkAddressIsContract } from '@/lib/contract';
import { Hat } from '@/types';

const fetchWearerAndControllerDetails = async (
  wearer: Hex,
  chainId: number | undefined,
) => {
  if (!wearer || !chainId) return undefined;

  if (wearer === FALLBACK_ADDRESS || wearer === ZERO_ADDRESS) {
    return {
      id: wearer,
      isContract: false,
      ensName: '',
    };
  }

  const data = await Promise.all([
    checkAddressIsContract(wearer, chainId),
    fetchEnsName({
      address: wearer,
      chainId: 1,
    }),
  ]).catch((err) => {
    // eslint-disable-next-line no-console
    console.log(err);
  });

  if (!data) return undefined;

  const [isContract, ensName] = data as [boolean, string];

  return {
    id: wearer,
    isContract,
    ensName: ensName || '',
  };
};

// hats-hooks or app-hooks
const useWearersControllersDetails = ({
  hats,
  editMode,
  onchain = false,
}: {
  hats: Hat[] | undefined;
  editMode?: boolean;
  onchain?: boolean;
}) => {
  const chainId = _.get(_.first(hats), 'chainId');
  // Don't spam the RPC with requests for wearers on individual hats. Handle OrgChart wearers + controllers
  const hatsWithIndividualWearers = _.filter(
    hats,
    (hat: Hat) => _.size(hat.wearers) === 1,
  );

  const wAndCs = _.uniq(
    _.compact(
      _.reject(
        _.concat(
          _.map(_.flatten(_.map(hatsWithIndividualWearers, 'wearers')), 'id'),
          _.flatten(_.map(hats, 'toggle')), // not nested in objects here
          _.flatten(_.map(hats, 'eligibility')), // not nested in objects here
        ),
        ZERO_ADDRESS || FALLBACK_ADDRESS,
      ),
    ),
  );

  const wearerAndControllerDetails = useQueries({
    queries: _.map(wAndCs, (wearer: any) => ({
      queryKey: ['wearerAndControllerDetails', { wearer, chainId, onchain }],
      queryFn: () => fetchWearerAndControllerDetails(wearer, chainId),
      enabled:
        !!wearer && isAddress(wearer) && wearer !== ZERO_ADDRESS && !!chainId,
      refetchInterval: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
    })),
  });
  const isLoaded = _.every(wearerAndControllerDetails, ['fetchStatus', 'idle']);

  if (!isLoaded || !_.eq(_.size(wearerAndControllerDetails), _.size(wAndCs)))
    return undefined;

  return _.compact(_.map(wearerAndControllerDetails, 'data'));
};

export default useWearersControllersDetails;
