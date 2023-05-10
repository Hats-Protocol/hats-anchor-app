/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
import { useContractReads } from 'wagmi';
import { useEffect, useState } from 'react';
import abi from '../contracts/Hats.json';
import { hatsAddresses } from '../constants';
import { chainsMap } from '../lib/web3';
import { isImageUrl } from '../lib/general';
import { PINATA_GATEWAY_TOKEN } from '../lib/ipfs';

/**
 * returns an object, mapping from hat id to image url.
 * uses multi call in order to call the "getImageURIForHat" function for every hat with one call.
 * for every url, checks if valid. If not, sets the image url to undefined.
 * @param {string[]} hats Array of hat IDs
 * @param {number} chainId Chain ID
 */
const useImageURIs = (hats, chainId) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  let calls = [];
  const chain = chainsMap(chainId);
  if (hats !== undefined) {
    calls = hats.map((hat) => {
      return {
        address: hatsAddresses(chain),
        chainId: chain.id,
        abi,
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
        const hatIdToImage = {};
        for (let i = 0; i < hats.length; i++) {
          const hat = hats[i];
          if (imagesData[i]?.startsWith('ipfs://')) {
            // converting the current base image uri from the contract to resolvable format
            hatIdToImage[
              hat
            ] = `https://indigo-selective-coral-505.mypinata.cloud/ipfs/${imagesData[
              i
            ].slice(7)}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`;
          } else {
            const isValidImage = await isImageUrl(imagesData[i]);
            if (isValidImage) {
              hatIdToImage[hat] = imagesData[i];
            } else {
              hatIdToImage[hat] = undefined;
            }
          }
        }

        setData(hatIdToImage);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    if (
      imagesData !== undefined &&
      imagesData !== null &&
      imagesData[0] !== null && // useContractReads returns with [null] at the beginning and then updates, TODO check if there's better fix
      hats !== undefined &&
      hats !== null &&
      !imagesLoading
    ) {
      validateImages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagesData, imagesLoading]);

  return { data, loading };
};

export default useImageURIs;
