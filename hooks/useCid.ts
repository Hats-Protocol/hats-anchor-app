/* eslint-disable import/no-unresolved */
import { calculateCid } from '@/lib/ipfs';
import _ from 'lodash';
import { useEffect, useState } from 'react';

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
      const cid = await calculateCid(data);

      setCid(cid);
      setLoading(false);
    }

    if (!_.isEqual(data, currentData)) {
      calcCid();
    }
  }, [data, currentData]);

  return { cid, loading };
};

export default useCid;
