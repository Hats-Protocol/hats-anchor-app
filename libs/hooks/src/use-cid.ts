import { isEqual } from 'lodash';
import { useEffect, useState } from 'react';
import { calculateCid } from 'utils';

/**
 * Computes the CID of a Json object
 * @param {*} data JS object representing the Json object
 * @returns The CID, prefixed with "ipfs://"
 */
const useCid = (data: object) => {
  const [currentData, setCurrentData] = useState<object>();
  const [cid, setCid] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function calcCid() {
      setLoading(true);
      setCurrentData(data);
      const localCid = await calculateCid(data);

      setCid(localCid);
      setLoading(false);
    }

    if (!isEqual(data, currentData)) {
      calcCid();
    }
  }, [data, currentData]);

  return { cid, loading };
};

export { useCid };
