import { solidityToTypescriptType, verify } from '@hatsprotocol/modules-sdk';
import { treeIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';

import CONFIG from '@/constants';

import { PINATA_GATEWAY_TOKEN } from './ipfs';

// app-utils mostly, some should move

export const formatAddress = (address: string | null | undefined) =>
  address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

export const isSameAddress = (address1?: string, address2?: string) => {
  if (!address1 || !address2) return false;
  return address1.toLowerCase() === address2.toLowerCase();
};

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

  return null;
};

export const transformInput = (
  input: unknown,
  solidityType: string,
): unknown => {
  if (input === undefined || input === null) {
    return undefined;
  }
  const tsType = solidityToTypescriptType(solidityType);

  switch (tsType) {
    case 'number':
      return Number(input);
    case 'bigint':
      // handle dates
      if (typeof input === 'object') {
        return BigInt(_.toNumber(input) / 1000);
      }
      // handle floats before here
      if (typeof input === 'string' || typeof input === 'number') {
        const numberCheck = _.toNumber(input);

        if (!_.isInteger(numberCheck)) {
          return undefined;
          // throw new Error('Must be an integer');
        }
        return BigInt(input);
      }
      break;
    case 'string':
      return String(input);
    case 'boolean':
      if (typeof input === 'string') {
        return input.toLowerCase() === 'yes';
      }
      return Boolean(input);
    case 'number[]':
      return String(input).split(',').map(Number);
    case 'bigint[]':
      // TODO  make sure these are valid bigints
      return String(input)
        .split(',')
        .map((num) => BigInt(num.trim()));
    case 'string[]':
      return String(input).split(',');
    case 'boolean[]':
      return String(input)
        .split(',')
        .map((str) => str.toLowerCase() === 'yes');
    default:
      throw new Error(`Invalid Solidity type: ${solidityType}`);
  }
  return undefined;
};

export const transformAndVerify = (
  input: unknown,
  solidityType: string,
): string | boolean => {
  const transformedInput = transformInput(input, solidityType);

  if (verify(transformedInput, solidityType)) {
    return true;
  }

  // TODO pass a more specific error message for types
  return 'This is not a valid input!';
};

export async function hash(string: string) {
  const utf8 = new TextEncoder().encode(string);
  const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((bytes) => bytes.toString(16).padStart(2, '0'))
    .join('');
  return hashHex;
}

// turn e.g. checkHatWearerStatus -> Check Hat Wearer Status
export function formatFunctionName(functionName: string): string {
  return functionName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase());
}

export function commify(value: any) {
  const match = value.match(/^(-?)([0-9]*)(\.?)([0-9]*)$/);
  if (!match || (!match[2] && !match[4])) {
    throw new Error(`bad formatted number: ${JSON.stringify(value)}`);
  }

  const neg = match[1];
  const whole = BigInt(match[2] || 0).toLocaleString('en-us');
  // const frac = match[4] ? match[4].match(/^(.*?)0*$/)[1] : '0';

  return `${neg}${whole}`;
  // return `${neg}${whole}.${frac}`;
}
