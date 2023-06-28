import { useContractReads } from 'wagmi';
import _ from 'lodash';

import CONFIG from '@/constants';
import abi from '@/contracts/Hats.json';
import { isImageUrl } from '@/lib/general';
import { PINATA_GATEWAY_TOKEN } from '@/lib/ipfs';
import { IHat } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { Abi } from 'viem';

/**
 * returns an object, mapping from hat id to image url.
 * uses multi call in order to call the "getImageURIForHat" function for every hat with one call.
 * for every url, checks if valid. If not, sets the image url to undefined.
 * @param {IHat[]} hats Array of Hats
 * @param {number} chainId Chain ID -- optional if not nested on hat object
 */
const useImageURIs = (hats: IHat[] | undefined, chainId?: number) => {
  const calls = _.map(hats, (hat) => {
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
  });

  const formatImageUrl = (url?: string) => {
    if (_.startsWith(url, 'https://')) {
      return url;
    }
    if (_.startsWith(url, 'ipfs://')) {
      return `${CONFIG.ipfsGateway}${url?.slice(
        7,
      )}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`;
    }
    if (_.startsWith(url, 'https://ipfs.io/ipfs/')) {
      const ipfsHash = url?.slice(21);
      const ipfsHashSplit = ipfsHash?.split('?')[0];
      const ipfsHashSplit2 = ipfsHashSplit?.split(',')[0];
      const ipfsHashSplit3 = ipfsHashSplit2?.split('&')[0];
      return `${CONFIG.ipfsGateway}${ipfsHashSplit3}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`;
    }

    return undefined;
  };

  const checkImagesForHats = async () => {
    const promises = _.map(imagesData, (imageData: { result: string }) => {
      return isImageUrl(formatImageUrl(imageData?.result));
    });
    const isValidImages = await Promise.all(promises);

    try {
      return _.map(hats, (hat, i) => {
        // console.log(imagesData?.[i]?.result);
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

  const { data, isLoading } = useQuery({
    queryKey: ['imageUrls', _.map(hats, 'id')],
    queryFn: checkImagesForHats,
    enabled: !_.isEmpty(hats),
  });

  return { data, isLoading: isLoading || imagesLoading };
};

export default useImageURIs;
