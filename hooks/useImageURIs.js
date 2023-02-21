import { multicall } from '@wagmi/core';
import abi from '../contracts/Hats.json';
import { useEffect, useState } from 'react';

const useImageURIs = (hats) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getImageURIs = async () => {
      try {
        const calls = hats.map((hat) => {
          return {
            address: '0x96bD657Fcc04c71B47f896a829E5728415cbcAa1', //TODO remove hardcoded goerli hats address
            abi: abi,
            functionName: 'getImageURIForHat',
            args: [hat.id],
          };
        });

        setLoading(true);
        const result = await multicall({ contracts: calls });
        let hatIdToImage = {};
        hats.map((hat, i) => {
          hatIdToImage[hat.id] = result[i];
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
