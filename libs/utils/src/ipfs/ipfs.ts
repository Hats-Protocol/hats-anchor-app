import {
  AUTHORITY_PLATFORMS,
  AUTHORITY_TYPES,
  AuthorityInfo,
  GATEWAY_TOKEN,
  GATEWAY_URL,
  GUILD_PLATFORMS,
} from '@hatsprotocol/constants';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import axios from 'axios';
import _ from 'lodash';
import { CID } from 'multiformats/cid';
import * as json from 'multiformats/codecs/json';
import * as raw from 'multiformats/codecs/raw';
import { sha256 } from 'multiformats/hashes/sha2';
import { ReactNode } from 'react';
import { Authority, FormDataDetails } from 'types';

export const calculateCid = async (data: object): Promise<string> => {
  const bytes = json.encode(data);
  const hash = await sha256.digest(bytes);
  const localCid = CID.create(1, raw.code, hash);
  return `ipfs://${localCid.toString()}`;
};

export const ipfsUrl = (hash: string | undefined) => {
  let localHash = hash;
  if (_.startsWith(localHash, 'ipfs://')) {
    localHash = localHash?.slice(7);
  }
  if (!localHash) return '#';
  return `${GATEWAY_URL}${localHash}?pinataGatewayToken=${GATEWAY_TOKEN}`;
};

export const pinJson = async (
  data: object,
  metadata: object,
  token: string,
) => {
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
      Authorization: `Bearer ${token}`,
    },
    data: pinataData,
  };

  const res = await axios(config);

  return _.get(res, 'data.IpfsHash');
};

export const pinImage = async ({
  file,
  metadata,
  token,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  file: any;
  metadata: object;
  token: string;
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
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return res.data.IpfsHash;
};

export const unpinImage = async (cid: string, token: string) => {
  const config = {
    method: 'delete',
    url: `https://api.pinata.cloud/pinning/unpin/${cid}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const res = await axios(config);
  return res;
};

interface handleDetailsPinProps {
  chainId: number;
  hatId: string;
  details: Partial<FormDataDetails>;
  token: string;
}

export const handleDetailsPin = async ({
  chainId,
  hatId,
  details,
  token,
}: handleDetailsPinProps) => {
  const detailsName = `details_${_.toString(chainId)}_${hatIdDecimalToIp(
    BigInt(hatId),
  )}`;

  // TODO [low] handle different details schemas
  const cid = `ipfs://${await pinJson(
    { type: '1.0', data: details },
    { name: detailsName },
    token,
  )}`;

  return cid;
};

export const urlToIpfsUri = (url: string) => {
  const match = url.match(/ipfs\/([a-zA-Z0-9]+)/);
  return match ? `ipfs://${match[1]}` : null;
};

export const fetchDetailsIpfs = async (detailsField: string | undefined) => {
  if (!detailsField) return null;
  const url = ipfsUrl(detailsField?.slice(7));
  if (!url) return null;

  // timeout is due to Pinata's gateway taking long time to return an error when file doesn't exist
  return axios
    .get(url, { timeout: 5000 })
    .then((res) =>
      Promise.resolve({ details: detailsField, data: _.get(res, 'data') }),
    )
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.log(err);
      return null;
    });
};

export const fetchToken = async (count: number = 0) => {
  const token = await fetch('/api/upload-start', {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({ count }),
  }).then((res) => res.text());

  return token;
};

export const fetchIpfs = async (value: string | undefined) => {
  if (!value) return null;

  let hash = value;
  if (hash.startsWith('ipfs://')) {
    hash = hash.slice(7);
  }

  const url = ipfsUrl(hash);
  if (!url) return null;

  // timeout is due to Pinata's gateway taking long time to return an error when file doesn't exist
  const res = await axios.get(url, { timeout: 5000 });
  return Promise.resolve({ details: hash, data: _.get(res, 'data') });
};

export const authorityImageHandler = ({
  authority,
  authorityEnforcement,
  editingItem,
  currentImageUrl,
}: AuthorityImageHandlerProps) => {
  const { type, imageUrl, id } = _.pick(authority, ['type', 'imageUrl', 'id']);

  if (!authority) return checkIfIpfs('');

  if (editingItem?.imageUrl) return checkIfIpfs(currentImageUrl);

  if (type === AUTHORITY_TYPES.gate) {
    // HANDLE GUILD PLATFORM MATCH
    const platformById = GUILD_PLATFORMS[id as keyof typeof GUILD_PLATFORMS];
    const platformInfo = AUTHORITY_PLATFORMS[platformById];
    if (platformInfo)
      return {
        icon: platformInfo.icon as ReactNode,
        isIpfs: false,
        imageUrl: '',
      };

    // HANDLE GENERIC PLATFORM MATCH
    const matchingPlatform = _.find(
      _.keys(AUTHORITY_PLATFORMS),
      (k: string) =>
        authority.gate?.includes(_.toLower(k)) ||
        authority.link?.includes(_.toLower(k)) ||
        _.toLower(authority.label)?.includes(_.toLower(k)),
    );
    const matchingPlatformInfo =
      AUTHORITY_PLATFORMS[matchingPlatform as string];
    if (matchingPlatformInfo)
      return {
        icon: matchingPlatformInfo.icon as ReactNode,
        isIpfs: false,
        imageUrl: '',
      };
    if (authority.link?.includes('docs.google')) {
      return {
        // doesn't recognize nested fetch
        icon: _.get(AUTHORITY_PLATFORMS, 'docs.icon') as unknown as ReactNode,
        isIpfs: false,
        imageUrl: '',
      };
    }
  }
  if (authority && typeof authorityEnforcement.imageUri === 'string') {
    return checkIfIpfs(authorityEnforcement.imageUri);
  }

  return checkIfIpfs(imageUrl);
};

const checkIfIpfs = (url: string | undefined) => {
  if (!url || typeof url !== 'string')
    return { isIpfs: false, imageUrl: '', icon: undefined };

  return {
    isIpfs: url.startsWith('ipfs://'),
    imageUrl: url,
    icon: undefined,
  };
};

interface AuthorityImageHandlerProps {
  authority: Authority | undefined;
  authorityEnforcement: AuthorityInfo;
  currentImageUrl?: string;
  editingItem?: Authority;
}
