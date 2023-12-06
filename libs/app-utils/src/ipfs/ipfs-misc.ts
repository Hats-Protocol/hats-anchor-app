/* eslint-disable */
import { CID } from 'multiformats/cid';
import * as json from 'multiformats/codecs/json';
import * as raw from 'multiformats/codecs/raw';
import { sha256 } from 'multiformats/hashes/sha2';

// multiformats is breaking eslint, holding here for now

export const calculateCid = async (data: object): Promise<string> => {
  const bytes = json.encode(data);
  const hash = await sha256.digest(bytes);
  const localCid = CID.create(1, raw.code, hash);
  return `ipfs://${localCid.toString()}`;
};
