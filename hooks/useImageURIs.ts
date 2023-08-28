import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { Abi } from 'viem';
import { useContractReads } from 'wagmi';

import CONFIG from '@/constants';
import abi from '@/contracts/Hats.json';
import { formatImageUrl, isImageUrl } from '@/lib/general';
import { IHat } from '@/types';

/**
 * returns an object, mapping from hat id to image url.
 * uses multi call in order to call the "getImageURIForHat" function for every hat with one call.
 * for every url, checks if valid. If not, sets the image url to undefined.
 * @param {IHat[]} hats Array of Hats
 * @param {number} chainId Chain ID -- optional if not nested on hat object
 */
const useImageURIs = (hats: IHat[] | undefined, chainId?: number) => {
  const calls: any = _.map(hats, (hat) => {
    return {
      address: CONFIG.hatsAddress,
      chainId: hat?.chainId || chainId,
      abi: abi as Abi,
      functionName: 'getImageURIForHat',
      args: [hat?.id || hat],
    };
  });

  const { data: imagesData, isLoading: imagesLoading } = useContractReads({
    contracts: calls,
    enabled: !!hats && !_.isEmpty(hats),
  });

  const checkImagesForHats = async () => {
    const promises = _.map(imagesData, (imageData: { result: string }) => {
      return isImageUrl(formatImageUrl(imageData?.result));
    });
    const isValidImages = await Promise.all(promises);

    try {
      return _.map(hats, (hat, i) => {
        return {
          ...hat,
          imageUrl: isValidImages[i]
            ? formatImageUrl(imagesData?.[i]?.result as string)
            : undefined,
        };
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
      return hats;
    }
  };

  const enabled = !_.isEmpty(hats) && !!imagesData;

  const { data, isLoading, fetchStatus } = useQuery({
    queryKey: ['imageUrls', _.map(hats, 'id')],
    queryFn: checkImagesForHats,
    enabled,
  });

  return {
    data,
    isLoading: (isLoading && fetchStatus !== 'idle') || imagesLoading,
  };
};

export default useImageURIs;
