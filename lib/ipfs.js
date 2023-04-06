import axios from 'axios';
import { CID } from 'multiformats/cid';
import * as json from 'multiformats/codecs/json';
import * as raw from 'multiformats/codecs/raw';
import { sha256 } from 'multiformats/hashes/sha2';

export const pinJson = async (data) => {
  let jwt = '';

  const pinataData = JSON.stringify({
    pinataOptions: {
      cidVersion: 1,
    },
    pinataContent: {
      ...data,
    },
  });

  const config = {
    method: 'post',
    url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    data: pinataData,
  };

  const res = await axios(config);
  console.log('pinned:', { ...data }, 'cid:', res.cid);

  return res;
};

export const getCID = async (name, description) => {
  const bytes = json.encode({ name, description });
  const hash = await sha256.digest(bytes);
  const cid = CID.create(1, raw.code, hash);
  console.log('cid local', cid.toString());
  return cid;
};
