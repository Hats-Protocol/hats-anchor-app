/* eslint-disable */
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import axios from 'axios';
import _ from 'lodash';
import { CID } from 'multiformats/cid';
import * as json from 'multiformats/codecs/json';
import * as raw from 'multiformats/codecs/raw';
import { sha256 } from 'multiformats/hashes/sha2';

import { FormDataDetails } from '@/types';

const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

export const PINATA_GATEWAY_TOKEN =
  process.env.NEXT_PUBLIC_PINATA_GATEWAY_TOKEN;

export const pinJson = async (data: object, metadata: object) => {
  const pinataData = JSON.stringify({
    pinataOptions: {
      cidVersion: 1,
    },
    pinataMetadata: {
      ...metadata,
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
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    data: pinataData,
  };

  const res = await axios(config);

  return _.get(res, 'data.IpfsHash');
};

export const pinImage = async ({
  file,
  metadata,
}: {
  file: File;
  metadata: object;
}) => {
  const formData = new FormData();
  formData.append('file', file);

  formData.append('pinataMetadata', JSON.stringify(metadata));

  const options = JSON.stringify({
    cidVersion: 1,
  });
  formData.append('pinataOptions', options);

  const res = await axios.post(
    'https://api.pinata.cloud/pinning/pinFileToIPFS',
    formData,
    {
      maxBodyLength: undefined,
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
    },
  );

  return res.data.IpfsHash;
};

export const unpinImage = async (cid: string) => {
  const config = {
    method: 'delete',
    url: `https://api.pinata.cloud/pinning/unpin/${cid}`,
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
    },
  };

  const res = await axios(config);
  // console.log('upnin res:', res);
  return res;
};

export const calculateCid = async (data: object): Promise<string> => {
  const bytes = json.encode(data);
  const hash = await sha256.digest(bytes);
  const localCid = CID.create(1, raw.code, hash);
  return `ipfs://${localCid.toString()}`;
};

interface handleDetailsPinProps {
  chainId: number;
  hatId: string;
  newDetails: Partial<FormDataDetails>;
  existingDetails?: Partial<FormDataDetails> | object;
}

export const handleDetailsPin = async ({
  chainId,
  hatId,
  newDetails,
  existingDetails,
}: handleDetailsPinProps) => {
  const detailsName = `details_${_.toString(chainId)}_${hatIdDecimalToIp(
    BigInt(hatId),
  )}`;

  const newDetailsData = _.merge(existingDetails, newDetails);

  const cid = `ipfs://${await pinJson(
    {
      type: '1.0',
      data: newDetailsData,
    },
    { name: detailsName },
  )}`;
  return cid;
};
