import {
  AUTHORITY_PLATFORMS,
  AUTHORITY_TYPES,
  AuthorityInfo,
  AuthorityPlatform,
  GATEWAY_TOKEN,
  GATEWAY_URL,
} from '@hatsprotocol/constants';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import axios from 'axios';
import { Authority, FormDataDetails } from 'hats-types';
import _ from 'lodash';
import { CID } from 'multiformats/cid';
import * as json from 'multiformats/codecs/json';
import * as raw from 'multiformats/codecs/raw';
import { sha256 } from 'multiformats/hashes/sha2';

export const calculateCid = async (data: object): Promise<string> => {
  const bytes = json.encode(data);
  const hash = await sha256.digest(bytes);
  const localCid = CID.create(1, raw.code, hash);
  return `ipfs://${localCid.toString()}`;
};

export const ipfsUrl = (hash: string | undefined) => {
  if (!hash) return null;
  return `${GATEWAY_URL}${hash}?pinataGatewayToken=${GATEWAY_TOKEN}`;
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
  return (
    axios
      .get(url, { timeout: 5000 })
      .then((res) =>
        Promise.resolve({ details: detailsField, data: _.get(res, 'data') }),
      )
      // eslint-disable-next-line no-console
      .catch((err) => console.log(err))
  );
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

export const fetchIpfs = async (hash: string | undefined) => {
  if (!hash) return null;
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

  if (editingItem) return checkIfIpfs(currentImageUrl);

  if (type === AUTHORITY_TYPES.gate) {
    const platformById =
      AUTHORITY_PLATFORMS[id as keyof typeof AUTHORITY_PLATFORMS];
    const matchingPlatform = _.find(
      _.values(AUTHORITY_PLATFORMS),
      (v: AuthorityPlatform) =>
        authority.gate?.includes(_.toLower(v.label)) ||
        authority.link?.includes(_.toLower(v.label)) ||
        _.toLower(authority.label)?.includes(_.toLower(v.label)),
    );
    if (platformById) return checkIfIpfs(platformById.icon);
    if (matchingPlatform) return checkIfIpfs(matchingPlatform.icon);
    if (authority.link?.includes('docs.google')) {
      return checkIfIpfs(AUTHORITY_PLATFORMS[4].icon);
    }
  }
  if (authority && authorityEnforcement.imageUri) {
    return checkIfIpfs(authorityEnforcement.imageUri);
  }

  return checkIfIpfs(imageUrl);
};

const checkIfIpfs = (url: string | undefined) => {
  if (!url) return { isIpfs: false, imageUrl: '' };

  return {
    isIpfs: url.startsWith('ipfs://'),
    imageUrl: url,
  };
};

interface AuthorityImageHandlerProps {
  authority: Authority | undefined;
  authorityEnforcement: AuthorityInfo;
  currentImageUrl?: string;
  editingItem?: Authority;
}
