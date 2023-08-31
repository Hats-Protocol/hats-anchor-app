import { useQueries } from '@tanstack/react-query';
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
 */
const useImageURIs = ({ hats }: { hats: IHat[] | undefined }) => {
  const calls: any = _.map(hats, (hat) => {
    return {
      address: CONFIG.hatsAddress,
      chainId: hat?.chainId,
      abi: abi as Abi,
      functionName: 'getImageURIForHat',
      args: [hat?.id || hat],
    };
  });

  const { data: imagesData, isLoading: imagesLoading } = useContractReads({
    contracts: calls,
    enabled: !!hats && !_.isEmpty(hats),
  });
  console.log('image hook - uris', imagesData);

  const uniqueImageUris = _.compact(
    _.uniq(_.map(imagesData, 'result')),
  ) as string[];

  const checkImageForHat = async (img: string) => {
    const isValidImage = await isImageUrl(formatImageUrl(img));

    let imageUrl = null;
    if (isValidImage) {
      imageUrl = formatImageUrl(img);
    }
    return imageUrl;
  };

  const enabled = !_.isEmpty(hats) && !!imagesData && !imagesLoading;

  const imageQueries = useQueries({
    queries: _.map(uniqueImageUris, (img) => ({
      queryKey: ['imageUrl', img],
      queryFn: () => checkImageForHat(img),
      enabled: enabled && !!img && img !== '',
      timeout: 5000,
    })),
  });
  console.log(
    'image hook - results',
    _.every(imageQueries, ['isLoading', false]),
    imageQueries,
  );

  const imageUrls = _.map(imageQueries, 'data');
  const isLoaded = _.every(imageQueries, ['isLoading', false]);

  let mergedWithHats;
  if (!imagesLoading && isLoaded) {
    mergedWithHats = _.map(hats, (hat, i) => {
      const imageIndex = _.findIndex(
        uniqueImageUris,
        (img) => img === (_.get(_.nth(imagesData, i), 'result') as string),
      );

      return {
        ...hat,
        imageUrl: imageUrls[imageIndex],
      };
    });
  }

  return {
    data: mergedWithHats || undefined,
    isLoading: !isLoaded || imagesLoading || !mergedWithHats,
  };
};

export default useImageURIs;
