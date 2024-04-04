// import { HatsClient } from '@hatsprotocol/sdk-v1-core';
import { CONFIG } from '@hatsprotocol/constants';
import { useQueries, useQuery } from '@tanstack/react-query';
import { checkImageIsValid } from 'hats-utils';
import _ from 'lodash';
import { useMemo } from 'react';
import { AppHat } from 'types';
import { viemPublicClient } from 'utils';
import { Abi, Hex, Narrow } from 'viem';

interface ContractCall {
  address: Hex;
  chainId: number;
  abi: Abi;
  functionName: string;
  args: Narrow<readonly unknown[] | undefined>;
}

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
  hats: AppHat[] | undefined;
  onchainHats?: AppHat[];
  editMode?: boolean;
  onchain?: boolean;
}) => {
  const initialHatsData = useMemo(() => {
    return hats?.map((hat) => ({
      ...hat,
      imageUrl: '/icon.jpeg',
    }));
  }, [hats]);

  const onlyOnchainHats = useMemo(() => {
    if (onchainHats) {
      return _.filter(hats, (hat: AppHat) =>
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
          args: [hat?.id],
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
      const clients: any[] = _.map(chainIds, (cId: number) =>
        viemPublicClient(cId),
      );

      const clientCalls = _.map(calls, (call: any, i: number) => {
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
      queryFn: () => checkImageIsValid(img),
      enabled: enabled && !!img && img !== '',
      timeout: 2000,
      refetchInterval: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
    })),
  });

  const imageUrls = _.map(imageQueries, 'data');
  // loading status sticks on true, if there is an error
  const isLoaded = _.every(imageQueries, ['fetchStatus', 'idle']);

  const mergedWithHats = useMemo(() => {
    if (imagesLoading || !isLoaded) return initialHatsData;
    return _.map(_.flatten(onlyOnchainHats), (hat: any, i: any) => {
      const imageIndex = _.findIndex(
        uniqueImageUris,
        (img: any) => img === _.get(_.nth(hatImageUris, i), 'result'),
      );

      return {
        ...hat,
        imageUrl: imageUrls[imageIndex] || hat.imageUrl, // use loaded image URL or fallback to initial
      };
    });
  }, [
    hatImageUris,
    onlyOnchainHats,
    uniqueImageUris,
    imageUrls,
    imagesLoading,
    isLoaded,
    initialHatsData,
  ]);

  return {
    data: mergedWithHats || undefined,
    isLoading: enabled && (!isLoaded || imagesLoading || !mergedWithHats),
  };
};

export default useImageURIs;
