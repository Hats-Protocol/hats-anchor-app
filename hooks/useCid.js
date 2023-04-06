import { useState, useEffect } from 'react';
import { CID } from 'multiformats/cid';
import * as json from 'multiformats/codecs/json';
import * as raw from 'multiformats/codecs/raw';
import { sha256 } from 'multiformats/hashes/sha2';

const useCid = (data) => {
  const [cid, setCid] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function calcCid() {
      setLoading(true);
      const bytes = json.encode(data);
      const hash = await sha256.digest(bytes);
      const cid = CID.create(1, raw.code, hash);
      //console.log('cid local', cid.toString());
      setCid('ipfs://' + cid.toString());
      setLoading(false);
    }

    calcCid();
  }, [data]);

  return { cid, loading };
};

export default useCid;
