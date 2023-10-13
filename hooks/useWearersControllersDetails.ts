import { useQueries } from '@tanstack/react-query';
import { fetchEnsName } from '@wagmi/core';
import _ from 'lodash';
import { Hex, isAddress } from 'viem';

import { FALLBACK_ADDRESS, ZERO_ADDRESS } from '@/constants';
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

const useWearersControllersDetails = ({
  hats,
  editMode,
}: {
  hats: Hat[] | undefined;
  editMode?: boolean;
}) => {
  const chainId = _.get(_.first(hats), 'chainId');
  const wAndCs = _.uniq(
    _.compact(
      _.reject(
        _.concat(
          _.map(_.flatten(_.map(hats, 'wearers')), 'id'),
          _.flatten(_.map(hats, 'toggle')), // not nested in objects here
          _.flatten(_.map(hats, 'eligibility')), // not nested in objects here
        ),
        ZERO_ADDRESS || FALLBACK_ADDRESS,
      ),
    ),
  );

  const wearerAndControllerDetails = useQueries({
    queries: _.map(wAndCs, (w) => ({
      queryKey: ['wearerAndControllerDetails', w, chainId],
      queryFn: () => fetchWearerAndControllerDetails(w, chainId),
      enabled: !!w && isAddress(w) && !!chainId,
      refetchInterval: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
    })),
  });
  const isLoaded = _.every(wearerAndControllerDetails, ['fetchStatus', 'idle']);

  if (!isLoaded || !_.eq(_.size(wearerAndControllerDetails), _.size(wAndCs)))
    return undefined;

  return _.compact(_.map(wearerAndControllerDetails, 'data'));
};

export default useWearersControllersDetails;
