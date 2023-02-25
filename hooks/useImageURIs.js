import { multicall } from '@wagmi/core';
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

  useEffect(() => {
    const getImageURIs = async () => {
      try {
        const calls = hats.map((hat) => {
          return {
            address: hatsAddresses(chainsMap(chainId)),
            abi: abi,
            functionName: 'getImageURIForHat',
            args: [hat.id],
          };
        });

        setLoading(true);
        const result = await multicall({ contracts: calls });

        let hatIdToImage = {};
        for (let i = 0; i < hats.length; i++) {
          let hat = hats[i];
          if (result[i].startsWith('ipfs://')) {
            hatIdToImage[hat.id] = `https://ipfs.io/ipfs/${result[i].slice(7)}`;
          } else {
            let isValidImage = await isImageUrl(result[i]);
            if (isValidImage) {
              hatIdToImage[hat.id] = result[i];
            } else {
              hatIdToImage[hat.id] = undefined;
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

    if (hats !== undefined) {
      getImageURIs();
    }
  }, [hats]);

  return { data, loading };
};

export default useImageURIs;
