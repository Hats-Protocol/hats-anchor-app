import { GATEWAY_TOKEN, GATEWAY_URL } from '@hatsprotocol/config';
import { AUTHORITY_PLATFORMS, AUTHORITY_TYPES, GUILD_PLATFORMS } from '@hatsprotocol/constants';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { find, get, keys, pick, startsWith, toLower, toString, trim } from 'lodash';
import { CID } from 'multiformats/cid';
import * as json from 'multiformats/codecs/json';
import * as raw from 'multiformats/codecs/raw';
import { sha256 } from 'multiformats/hashes/sha2';
import { ReactNode } from 'react';
import { Authority, AuthorityInfo, FormDataDetails } from 'types';

export const calculateCid = async (data: object): Promise<string> => {
  const bytes = json.encode(data);
  const hash = await sha256.digest(bytes);
  const localCid = CID.create(1, raw.code, hash);
  return `ipfs://${localCid.toString()}`;
};

export const ipfsUrl = (hash: string | undefined, publicGateway?: boolean) => {
  let localHash = hash;
  if (startsWith(localHash, 'ipfs://')) {
    localHash = localHash?.slice(7);
  }
  if (!localHash) return ''; // Adverse affect of empty string?
  if (publicGateway) return `https://ipfs.io/ipfs/${localHash}`;
  return `${GATEWAY_URL}${localHash}?pinataGatewayToken=${GATEWAY_TOKEN}`;
};

export const pinJson = async (data: object, metadata: object, token: string) => {
  const pinataData = JSON.stringify({
    pinataOptions: { cidVersion: 1 },
    pinataMetadata: { ...metadata },
    pinataContent: { ...data },
  });

  const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
  const config = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    data: pinataData,
  };

  const res = await fetch(url, config);

  return get(res, 'data.IpfsHash');
};

// TODO wrap/combine with pinFileToIpfs
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

  const options = JSON.stringify({ cidVersion: 1 });
  formData.append('pinataOptions', options);

  const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();

  return get(data, 'IpfsHash');
};

export const unpinImage = async (cid: string, token: string) => {
  const url = `https://api.pinata.cloud/pinning/unpin/${cid}`;
  const config = {
    method: 'delete',
    headers: { Authorization: `Bearer ${token}` },
  };

  const res = await fetch(url, config);
  return res;
};

interface handleDetailsPinProps {
  chainId: number;
  hatId: string;
  details: Partial<FormDataDetails>;
  token: string;
}

export const handleDetailsPin = async ({ chainId, hatId, details, token }: handleDetailsPinProps) => {
  const detailsName = `details_${toString(chainId)}_${hatIdDecimalToIp(BigInt(hatId))}`;

  // TODO [low] handle different details schemas
  const cid = `ipfs://${await pinJson({ type: '1.0', data: details }, { name: detailsName }, token)}`;

  return cid;
};

export const handleAgreementPin = async ({
  agreement,
  address,
  chainId,
  token,
}: {
  agreement: string;
  address: string | undefined;
  chainId: number | undefined;
  token: string;
}) => {
  const cid = await pinFileToIpfs({
    file: agreement,
    fileName: `agreement_${address}_${chainId}`,
    token,
  });
  return cid;
};

export const pinFileToIpfs = async ({ file, fileName, token }: { file: string; fileName: string; token: string }) => {
  const formData = new FormData();

  const localFile = new File([file], fileName, { type: 'text/plain' });
  formData.append('file', localFile);

  const pinataMetadata = JSON.stringify({ name: fileName });
  formData.append('pinataMetadata', pinataMetadata);

  const pinataOptions = JSON.stringify({ cidVersion: 1 });
  formData.append('pinataOptions', pinataOptions);

  const request = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const response = await request.json();
  const ipfsHash = get(response, 'IpfsHash');

  return `ipfs://${ipfsHash}`;
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
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout after 5 seconds

  return fetch(url, { signal: controller.signal })
    .then((res) => Promise.resolve({ details: detailsField, data: get(res, 'data') }))
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.log(err);
      return null;
    })
    .finally(() => {
      clearTimeout(timeoutId); // Clear the timeout
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
    // return only the token
  }).then((res) => res.json().then((data) => data.apiKey));

  return token;
};

export const fetchIpfs = async (value: string | undefined) => {
  if (!value) return Promise.resolve({ details: '', data: null });

  let hash = value;
  if (hash.startsWith('ipfs://')) {
    hash = hash.slice(7);
  }

  const url = ipfsUrl(hash);
  if (!url) return Promise.reject({ details: hash, data: null });

  // timeout is due to Pinata's gateway taking long time to return an error when file doesn't exist
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout after 5 seconds

  return fetch(url, { signal: controller.signal })
    .then(async (res) => {
      const result = await res.json();
      return Promise.resolve({ details: hash, data: result || null });
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.log(err);
      return Promise.reject({ details: hash, data: null });
    })
    .finally(() => {
      clearTimeout(timeoutId); // Clear the timeout
    });
};

export const authorityImageHandler = ({
  authority,
  authorityEnforcement,
  editingItem,
  currentImageUrl,
}: AuthorityImageHandlerProps) => {
  const { type, imageUrl, id } = pick(authority, ['type', 'imageUrl', 'id']);

  if (!authority) return checkIfIpfs('');

  // HANDLE CURRENTLY EDITING ITEM
  if (editingItem?.imageUrl) return checkIfIpfs(currentImageUrl);

  // HANDLE GUILD PLATFORM MATCH
  if (type === AUTHORITY_TYPES.gate) {
    const platformById = GUILD_PLATFORMS[id as keyof typeof GUILD_PLATFORMS];
    const platformInfo = AUTHORITY_PLATFORMS[platformById];
    if (platformInfo) {
      return {
        icon: platformInfo.icon as ReactNode,
        isIpfs: false,
        imageUrl: '',
      };
    }
  }

  // HANDLE GENERIC PLATFORM MATCH
  const matchingPlatform = find(
    keys(AUTHORITY_PLATFORMS),
    (k: string) =>
      authority.gate?.includes(toLower(k)) ||
      authority.link?.includes(toLower(k)) ||
      toLower(authority.label)?.includes(toLower(k)),
  );
  const matchingPlatformInfo = AUTHORITY_PLATFORMS[matchingPlatform as string];
  if (matchingPlatformInfo) {
    return {
      icon: matchingPlatformInfo.icon as ReactNode,
      isIpfs: false,
      imageUrl: '',
    };
  }

  // TODO why are we needing this extra fallback? can we extend AUTHORITY_PLATFORMS for this?
  if (authority.link?.includes('docs.google')) {
    return {
      // doesn't recognize nested fetch
      icon: get(AUTHORITY_PLATFORMS, 'docs.icon') as unknown as ReactNode,
      isIpfs: false,
      imageUrl: '',
    };
  }

  // HANDLE IMAGE URI
  if (authority && typeof authorityEnforcement.imageUri === 'string') {
    return checkIfIpfs(authorityEnforcement.imageUri);
  }

  return checkIfIpfs(imageUrl);
};

export const checkIfIpfs = (url: string | undefined) => {
  if (!url || typeof url !== 'string' || url === '-') return { isIpfs: false, imageUrl: '', icon: undefined };

  const isIpfs = url.startsWith('ipfs://');

  return {
    isIpfs,
    imageUrl: isIpfs ? ipfsUrl(url) : trim(url),
    icon: undefined,
  };
};

interface AuthorityImageHandlerProps {
  authority: Authority | undefined;
  authorityEnforcement: AuthorityInfo;
  currentImageUrl?: string;
  editingItem?: Authority;
}
