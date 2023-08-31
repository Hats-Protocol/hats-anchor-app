import { useQueries } from '@tanstack/react-query';
import { fetchEnsName } from '@wagmi/core';
import _ from 'lodash';
import { Hex, isAddress } from 'viem';

import { FALLBACK_ADDRESS, ZERO_ADDRESS } from '@/constants';
import { checkAddressIsContract } from '@/lib/contract';
import { IHat } from '@/types';

const fetchWearerAndControllerDetails = async (
  wearer: Hex,
  chainId: number | undefined,
) => {
  if (!wearer || !chainId) return undefined;
  const data = await Promise.all([
    checkAddressIsContract(wearer, chainId),
    fetchEnsName({
      address: wearer,
      chainId: 1,
    }),
  ]).catch((err) => {
    // eslint-disable-next-line no-console
    console.log(err);
    return [];
  });

  return {
    id: wearer,
    isContract: data[0] as boolean,
    ensName: data[1] as string,
  };
};

const useWearersControllersDetails = ({ hats }: { hats: IHat[] }) => {
  const chainId = _.get(_.first(hats), 'chainId');
  const wAndCs = _.uniq(
    _.compact(
      _.reject(
        _.concat(
          _.map(_.flatten(_.map(hats, 'wearers')), 'id'),
          _.map(_.flatten(_.map(hats, 'toggle')), 'id'),
          _.map(_.flatten(_.map(hats, 'eligibility')), 'id'),
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
    })),
  });

  return _.compact(_.map(wearerAndControllerDetails, 'data'));
};

export default useWearersControllersDetails;
