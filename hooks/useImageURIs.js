import { useContractReads } from 'wagmi';
import abi from '../contracts/Hats.json';
import { useEffect, useState } from 'react';
import { hatsAddresses } from '../constants';
import { chainsMap } from '../lib/web3';
import { isImageUrl } from '../lib/general';

/**
 * returns an object, mapping from hat id to image url.
 * uses multi call in order to call the "getImageURIForHat" function for every hat with one call.
 * for every url, checks if valid. If not, sets the image url to undefined.
 */
const useImageURIs = (hats, chainId) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  let calls = [];
  if (hats !== undefined) {
    calls = hats.map((hat) => {
      return {
        address: hatsAddresses(chainsMap(chainId)),
        abi: abi,
        functionName: 'getImageURIForHat',
        args: [hat],
      };
    });
  }

  const { data: imagesData, isLoading: imagesLoading } = useContractReads({
    contracts: calls,
  });

  useEffect(() => {
    const validateImages = async () => {
      try {
        setLoading(true);
        let hatIdToImage = {};
        for (let i = 0; i < hats.length; i++) {
          let hat = hats[i];
          if (imagesData[i].startsWith('ipfs://')) {
            //converting the current base image uri from the contract to resolvable format
            hatIdToImage[hat] = `https://ipfs.io/ipfs/${imagesData[i].slice(
              7,
            )}`;
          } else {
            let isValidImage = await isImageUrl(imagesData[i]);
            if (isValidImage) {
              hatIdToImage[hat] = imagesData[i];
            } else {
              hatIdToImage[hat] = undefined;
            }
          }
        }

        setData(hatIdToImage);
      } catch (error) {
        setLoading(false);
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    if (
      imagesData !== undefined &&
      imagesData !== null &&
      hats !== undefined &&
      !imagesLoading
    ) {
      validateImages();
    }
  }, [imagesData]);

  return { data, loading };
};

export default useImageURIs;
