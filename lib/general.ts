import { treeIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';

import CONFIG from '@/constants';

import { PINATA_GATEWAY_TOKEN } from './ipfs';

// unused
export function parseUri(uri: string) {
  const parsed = JSON.parse(uri);
  return parsed;
}

// unused
export function decodeUri(uri: string) {
  const decoded = Buffer.from(uri.substring(29), 'base64').toString('utf8');
  return decoded;
}

export const formatAddress = (address: string | null | undefined) =>
  address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

export const isSameAddress = (address1?: string, address2?: string) => {
  if (!address1 || !address2) return false;
  return address1.toLowerCase() === address2.toLowerCase();
};

// unused
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const clearNonObjects = (array: any[]) => {
  return _.filter(array, (item) => typeof item === 'object');
};

// unused?
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchWithTimeout(resource: any, options: any = {}) {
  const { timeout = 8000 } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal,
  });
  clearTimeout(id);
  return response;
}

export const mapWithChainId = (
  array: object[] | undefined,
  chainId: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any[] => _.map(array, (obj: object) => ({ ...obj, chainId }));

export const containsUpperCase = (string: string) => /\p{Lu}/u.test(string);

export const validateURL = (textVal: string) => {
  const urlRegex =
    /^((http|https):\/\/)(www\.)?[a-zA-Z0-9\-.]+(\.[a-zA-Z]{2,})+(\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;%=]*)?$/;
  return urlRegex.test(textVal);
};

export const generateLocalStorageKey = (
  chainId: number | undefined,
  treeId: string | undefined,
) => {
  if (!chainId || !treeId) return 'not found';
  const decimalTreeId = treeIdHexToDecimal(treeId);
  return `treeData-${chainId}-${decimalTreeId}`;
};

/**
 * checks if a url links to an image
 */
export async function isImageUrl(url: string | unknown) {
  if (typeof url === 'string' && url?.startsWith('http')) {
    try {
      return fetchWithTimeout(url, { method: 'HEAD' })
        .then((res) => {
          if (!res.ok) {
            // eslint-disable-next-line no-console
            console.log(res);
            return false;
          }
          return res.headers?.get('Content-Type')?.startsWith('image') || false;
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.log(error);
          // throw new Error(`Fetching ${url} failed`);
          return false;
        });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
      return false;
    }
  }

  return false;
}

export const formatImageUrl = (url?: string) => {
  if (_.startsWith(url, 'https://')) {
    return url;
  }
  if (_.startsWith(url, 'ipfs://')) {
    return `${CONFIG.ipfsGateway}${url?.slice(
      7,
    )}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`;
  }
  if (_.startsWith(url, 'https://ipfs.io/ipfs/')) {
    const ipfsHash = url?.slice(21);
    const ipfsHashSplit = ipfsHash?.split('?')[0];
    const ipfsHashSplit2 = ipfsHashSplit?.split(',')[0];
    const ipfsHashSplit3 = ipfsHashSplit2?.split('&')[0];
    return `${CONFIG.ipfsGateway}${ipfsHashSplit3}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`;
  }

  return undefined;
};
