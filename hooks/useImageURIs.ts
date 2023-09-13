import { useQueries, useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { useMemo } from 'react';
import { Abi, createPublicClient, Hex, http, Narrow } from 'viem';
import { useContractReads } from 'wagmi';

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

  const chainId = _.get(_.first(onlyOnchainHats), 'chainId');

  const calls: ContractCall[] = useMemo(() => {
    return _.map(onlyOnchainHats, (hat) => {
      return {
        address: CONFIG.hatsAddress,
        chainId: hat?.chainId,
        abi: abi as Abi,
        functionName: 'getImageURIForHat',
        args: [hat?.id || hat],
      };
    });
  }, [onlyOnchainHats]);

  const { data: imagesData, isLoading: imagesLoading } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['imageURIs', _.map(onlyOnchainHats, 'id'), chainId],
    queryFn: () => {
      const client = createPublicClient({
        chain: chainsMap(chainId),
        transport: http(),
      });

      return client.multicall({ contracts: calls });
    },
    enabled: !!calls && !_.isEmpty(calls),
  });

  // const { data: imagesData, isLoading: imagesLoading } = useContractReads({
  //   contracts: calls,
  //   enabled: !!hats && !_.isEmpty(hats),
  // });
  // console.log('call result', imagesData);

  const uniqueImageUris = useMemo(() => {
    return _.compact(_.uniq(_.map(imagesData, 'result'))) as string[];
  }, [imagesData]);

  const enabled = !_.isEmpty(hats) && !!imagesData && !imagesLoading;

  const imageQueries = useQueries({
    queries: _.map(uniqueImageUris, (img) => ({
      queryKey: ['imageUrl', img],
      queryFn: () => checkImageForHat(img),
      enabled: enabled && !!img && img !== '',
      timeout: 5000,
    })),
  });

  const imageUrls = _.map(imageQueries, 'data');
  // console.log(imageUrls);
  const isLoaded = _.every(imageQueries, ['isLoading', false]);

  const mergedWithHats = useMemo(() => {
    if (imagesLoading || !isLoaded) return undefined;
    return _.map(onlyOnchainHats, (hat, i) => {
      const imageIndex = _.findIndex(
        uniqueImageUris,
        (img) => img === (_.get(_.nth(imagesData, i), 'result') as string),
      );

      return {
        ...hat,
        imageUrl: imageUrls[imageIndex],
      };
    });
  }, [
    onlyOnchainHats,
    uniqueImageUris,
    imagesData,
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
