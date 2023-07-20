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
  const [cid, setCid] = useState('');
  const [loading, setLoading] = useState(false);

  useDeepCompareEffect(() => {
    async function calcCid() {
      setLoading(true);
      const bytes = json.encode(data);
      const hash = await sha256.digest(bytes);
      const localCid = CID.create(1, raw?.code, hash);
      setCid(`ipfs://${localCid.toString()}`);
      setLoading(false);
    }

    calcCid();
  }, [data]);

  return { cid, loading };
};

function useDeepCompareEffect(callback: any, dependencies: any) {
  const firstRenderRef = useRef(true);
  const dependenciesRef = useRef(dependencies);

  if (!_.isEqual(dependencies, dependenciesRef.current)) {
    dependenciesRef.current = dependencies;
  }

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }

    // eslint-disable-next-line consistent-return
    return callback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dependenciesRef.current]);
}

export default useCid;
