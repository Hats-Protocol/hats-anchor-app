import { multicall } from '@wagmi/core';
import abi from '../contracts/Hats.json';
import { useEffect, useState } from 'react';
import { hatsAddresses } from '../constants';
import { chainsMap } from '../lib/web3';

const useImageURIs = (hats, chainId) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getImageURIs = async () => {
      try {
        const calls = hats.map((hat) => {
          return {
            address: hatsAddresses(chainsMap(chainId)), //TODO remove hardcoded goerli hats address
            abi: abi,
            functionName: 'getImageURIForHat',
            args: [hat.id],
          };
        });

        setLoading(true);
        const result = await multicall({ contracts: calls });
        let hatIdToImage = {};
        hats.map((hat, i) => {
          if (result[i].startsWith('ipfs://')) {
            hatIdToImage[hat.id] = `https://ipfs.io/ipfs/${result[i].slice(7)}`;
          } else {
            hatIdToImage[hat.id] = result[i];
          }
        });
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
