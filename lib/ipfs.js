import axios from 'axios';
import { CID } from 'multiformats/cid';
import * as json from 'multiformats/codecs/json';
import * as raw from 'multiformats/codecs/raw';
import { sha256 } from 'multiformats/hashes/sha2';

export const pinJson = async (data) => {
  let jwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIyYTEzMjFjYi03Y2VjLTQzNDQtYTU0Yi0zNjE3Y2E2Y2UzNjgiLCJlbWFpbCI6ImdlcnNoaWRvQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfSx7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJkYmI2MDhlOTY1MmM5ZWUyN2FmNSIsInNjb3BlZEtleVNlY3JldCI6IjE4NjBlNDRmNjY4ZTk4MDUxZjlmNDBhNGYwNGEyNzIzZWE4NzFlZmJkNmMyYTAxZGIwYzU1OTNmYTllMzk3NzgiLCJpYXQiOjE2NzkwODYyODJ9.xwMsS3EMsgoGECjiSNCucxk96gaFUSUzrRr1my_RMi8';

  const data = JSON.stringify({
    pinataOptions: {
      cidVersion: 1,
    },
    pinataContent: {
      name: data.name,
      description: data.description,
    },
  });

  const config = {
    method: 'post',
    url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    data: data,
  };

  const res = await axios(config);
  console.log('cid pin:', res.data);

  return res;
};

export const getCID = async (name, description) => {
  const bytes = json.encode({ name, description });
  const hash = await sha256.digest(bytes);
  const cid = CID.create(1, raw.code, hash);
  console.log('cid local', cid.toString());
  return cid;
};
