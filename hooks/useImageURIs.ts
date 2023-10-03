import { useQueries, useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { useMemo } from 'react';
import { Abi, createPublicClient, Hex, http, Narrow } from 'viem';

import CONFIG from '@/constants';
import abi from '@/contracts/Hats.json';
import { checkImageForHat } from '@/lib/hats';
import { chainsMap } from '@/lib/web3';
import { IHat } from '@/types';

interface ContractCall {
  address: Hex;
  chainId: number;
  abi: Abi;
  functionName: string;
  args: Narrow<readonly unknown[] | undefined>;
}

const tempClient = (chainId: number) => {
  const client = createPublicClient({
    chain: chainsMap(chainId),
    transport: http(),
  });
  return client;
};

/**
 * returns an object, mapping from hat id to image url.
 * uses multi call in order to call the "getImageURIForHat" function for every hat with one call.
 * for every url, checks if valid. If not, sets the image url to undefined.
 * @param {IHat[]} hats Array of Hats
 */
const useImageURIs = ({
  hats,
  onchainHats,
}: {
  hats: IHat[] | undefined;
  onchainHats?: IHat[];
}) => {
  const onlyOnchainHats = useMemo(() => {
    if (onchainHats) {
      return _.filter(hats, (hat) =>
        _.includes(_.map(onchainHats, 'id'), hat?.id),
      );
    }
    return hats;
  }, [hats, onchainHats]);

  const chainIds = _.uniq(_.map(onlyOnchainHats, 'chainId'));

  const calls: ContractCall[][] = useMemo(() => {
    return _.map(chainIds, (cId) => {
      const hatsForChain = _.filter(onlyOnchainHats, ['chainId', cId]);
      return _.map(hatsForChain, (hat) => {
        return {
          address: CONFIG.hatsAddress,
          chainId: hat?.chainId,
          abi: abi as Abi,
          functionName: 'getImageURIForHat',
          args: [hat?.id || hat],
        };
      });
    });
  }, [onlyOnchainHats, chainIds]);

  const { data: imagesData, isLoading: imagesLoading } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['imageURIs', _.map(onlyOnchainHats, 'id'), chainIds],
    queryFn: () => {
      const clients = _.map(chainIds, (cId) => tempClient(cId));

      const clientCalls = _.map(calls, (call, i) => {
        return clients[i].multicall({ contracts: call });
      });

      return Promise.all(clientCalls);
    },
    enabled: !!calls && !_.isEmpty(calls) && !!chainIds && !_.isEmpty(chainIds),
  });

  const hatImageUris = useMemo(() => {
    const allImageUris = _.map(chainIds, (cId, i) => {
      const hatsForChain = _.filter(onlyOnchainHats, ['chainId', cId]);
      const imagesForChain = _.get(imagesData, i);
      return _.map(hatsForChain, (hat, j) => {
        return {
          id: hat?.id || hat,
          chainId: hat?.chainId,
          result: _.get(_.get(imagesForChain, j), 'result'),
        };
      });
    });

    return _.flatten(allImageUris);
  }, [imagesData, chainIds, onlyOnchainHats]);

  const uniqueImageUris = useMemo(() => {
    return _.uniq(_.map(hatImageUris, 'result')) as string[];
  }, [hatImageUris]);

  const enabled = !_.isEmpty(hats) && !!imagesData && !imagesLoading;

  const imageQueries = useQueries({
    queries: _.map(uniqueImageUris, (img) => ({
      queryKey: ['imageUrl', img],
      queryFn: () => checkImageForHat(img),
      enabled: enabled && !!img && img !== '',
      timeout: 2000,
    })),
  });

  const imageUrls = _.map(imageQueries, 'data');
  // loading status sticks on true, if there is an error
  const isLoaded = _.every(imageQueries, ['fetchStatus', 'idle']);

  const mergedWithHats = useMemo(() => {
    if (imagesLoading || !isLoaded) return undefined;
    return _.map(_.flatten(onlyOnchainHats), (hat, i) => {
      const imageIndex = _.findIndex(
        uniqueImageUris,
        (img) => img === _.get(_.nth(hatImageUris, i), 'result'),
      );

      return {
        ...hat,
        imageUrl: imageUrls[imageIndex],
      };
    });
  }, [
    hatImageUris,
    onlyOnchainHats,
    uniqueImageUris,
    imageUrls,
    imagesLoading,
    isLoaded,
  ]);

  return {
    data: mergedWithHats || undefined,
    isLoading: !isLoaded || imagesLoading || !mergedWithHats,
  };
};

export default useImageURIs;
