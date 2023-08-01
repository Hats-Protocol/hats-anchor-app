/* eslint-disable import/no-unresolved */
import _ from 'lodash';
import { CID } from 'multiformats/cid';
import * as json from 'multiformats/codecs/json';
import * as raw from 'multiformats/codecs/raw';
import { sha256 } from 'multiformats/hashes/sha2';
import { useEffect, useRef, useState } from 'react';

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
      const bytes = json.encode(data);
      const hash = await sha256.digest(bytes);
      const localCid = CID.create(1, raw?.code, hash);
      setCid(`ipfs://${localCid.toString()}`);
      setLoading(false);
    }

    if (!_.isEqual(currentData, data)) {
      calcCid();
    }
  }, [data, currentData]);

  return { cid, loading };
};

export default useCid;
