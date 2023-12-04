import { useQueries, useQuery } from '@tanstack/react-query';
import { CONFIG } from 'app-utils';
import { Hat } from 'hats-types';
import _ from 'lodash';
import { useMemo } from 'react';
import { Abi, createPublicClient, Hex, http, Narrow } from 'viem';

import { chainsMap } from '../lib/chains/index';
import { checkImageForHat } from '../lib/hats';

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

// image-sdk/hooks
/**
 * returns an object, mapping from hat id to image url.
 * uses multi call in order to call the "getImageURIForHat" function for every hat with one call.
 * for every url, checks if valid. If not, sets the image url to undefined.
 * @param {Hat[]} hats Array of Hats
 */
const useImageURIs = ({
  hats,
  onchainHats,
  editMode = false,
  onchain = false,
}: {
  hats: Hat[] | undefined;
  onchainHats?: Hat[];
  editMode?: boolean;
  onchain?: boolean;
}) => {
  const onlyOnchainHats = useMemo(() => {
    if (onchainHats) {
      return _.filter(hats, (hat: Hat) =>
        _.includes(_.map(onchainHats, 'id'), hat?.id),
      );
    }
    return hats;
  }, [hats, onchainHats]);

  const chainIds = _.uniq(_.map(onlyOnchainHats, 'chainId'));

  const calls: ContractCall[][] = useMemo(() => {
    return _.map(chainIds, (cId: any) => {
      const hatsForChain = _.filter(onlyOnchainHats, ['chainId', cId]);
      return _.map(hatsForChain, (hat: any) => {
        return {
          address: CONFIG.hatsAddress,
          chainId: hat?.chainId,
          abi: CONFIG.hatsAbi,
          functionName: 'getImageURIForHat',
          args: [hat?.id || hat],
        };
      });
    });
  }, [onlyOnchainHats, chainIds]);

  const { data: imagesData, isLoading: imagesLoading } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: [
      'imageURIs',
      { hatIds: _.map(onlyOnchainHats, 'id'), chainIds, onchain },
    ],
    queryFn: () => {
      const clients = _.map(chainIds, (cId: number) => tempClient(cId));

      const clientCalls = _.map(calls, (call: any, i: string | number) => {
        return clients[i].multicall({ contracts: call });
      });

      return Promise.all(clientCalls);
    },
    enabled: !!calls && !_.isEmpty(calls) && !!chainIds && !_.isEmpty(chainIds),
    refetchInterval: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
  });

  const hatImageUris = useMemo(() => {
    const allImageUris = _.map(chainIds, (cId: any, i: any) => {
      const hatsForChain = _.filter(onlyOnchainHats, { chainId: cId });
      const imagesForChain = _.get(imagesData, i);
      return _.map(hatsForChain, (hat: { id: any; chainId: any }, j: any) => {
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
    return _.filter(
      _.uniq(_.map(hatImageUris, 'result')) as string[],
      (img: string) => img !== '',
    );
  }, [hatImageUris]);

  const enabled = !_.isEmpty(hats) && !!imagesData && !imagesLoading;

  const imageQueries = useQueries({
    queries: _.map(uniqueImageUris, (img: string | undefined) => ({
      queryKey: ['imageUrl', img],
      queryFn: () => checkImageForHat(img),
      enabled: enabled && !!img && img !== '',
      timeout: 2000,
      refetchInterval: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
    })),
  });

  const imageUrls = _.map(imageQueries, 'data');
  // loading status sticks on true, if there is an error
  const isLoaded = _.every(imageQueries, ['fetchStatus', 'idle']);

  const mergedWithHats = useMemo(() => {
    if (imagesLoading || !isLoaded) return undefined;
    return _.map(_.flatten(onlyOnchainHats), (hat: any, i: any) => {
      const imageIndex = _.findIndex(
        uniqueImageUris,
        (img: any) => img === _.get(_.nth(hatImageUris, i), 'result'),
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
