import {
  ArgumentTsType,
  solidityToTypescriptType,
  verify,
} from '@hatsprotocol/modules-sdk';
import { treeIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { CONFIG, GATEWAY_TOKEN } from '@hatsprotocol/constants';
import { format } from 'date-fns';
import _ from 'lodash';
import { isAddress } from 'viem';

export const formatAddress = (address: string | null | undefined) =>
  address && typeof address === 'string'
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : '';

export const isSameAddress = (address1?: string, address2?: string) => {
  if (!address1 || !address2) return false;
  return address1.toLowerCase() === address2.toLowerCase();
};

const dateFormatter = (date: Date | number) =>
  format(date, 'yyyy-MM-dd HH:mm:ss');

const offsetString = (date: Date) => {
  const utcOffset = -date.getTimezoneOffset() / 60;
  return `UTC${utcOffset > 0 ? '+' : ''}${utcOffset}`;
};

export const formatDate = (
  date: Date | string | number | undefined,
  toUtc: boolean = false,
) => {
  if (!date) return '';
  if (toUtc)
    return `${dateFormatter(
      // calculate UTC time based on user's local timezone offset
      new Date(date).getTime() + new Date().getTimezoneOffset() * 60 * 1000,
    )} UTC`;
  if (typeof date === 'string' || typeof date === 'number')
    return `${dateFormatter(new Date(date))} ${offsetString(new Date(date))}`;
  return `${dateFormatter(date)} ${offsetString(date)}`;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchWithTimeout(resource: any, options: any = {}) {
  const { timeout = 5000 } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal,
  });
  clearTimeout(id);
  return response;
}

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
  if (_.startsWith(url, 'https://') || _.startsWith(url, '/')) {
    return url;
  }
  if (_.startsWith(url, 'ipfs://')) {
    return `${CONFIG.ipfsGateway}${url?.slice(
      7,
    )}?pinataGatewayToken=${GATEWAY_TOKEN}`;
  }
  if (_.startsWith(url, 'https://ipfs.io/ipfs/')) {
    const ipfsHash = url?.slice(21);
    const ipfsHashSplit = ipfsHash?.split('?')[0];
    const ipfsHashSplit2 = ipfsHashSplit?.split(',')[0];
    const ipfsHashSplit3 = ipfsHashSplit2?.split('&')[0];
    return `${CONFIG.ipfsGateway}${ipfsHashSplit3}?pinataGatewayToken=${GATEWAY_TOKEN}`;
  }

  return null;
};

const convertToBigInt = (input: unknown) => {
  // directly convert, if string (but make sure it's not a decimal or will crash)
  const localString = _.toString(input);
  if (localString && !localString?.includes('.')) {
    return BigInt(input as string);
  }
  // handle numbers
  const numberCheck = _.toNumber(input);
  if (_.isNaN(numberCheck)) {
    return 'Invalid input: Not a valid number';
  }

  if (!_.isInteger(numberCheck)) {
    return 'Invalid input: Decimal numbers are not accepted';
  }

  return BigInt(numberCheck);
};

export const transformInput = (
  input: unknown,
  solidityType: string,
  displayType?: string,
): unknown => {
  console.log('transformInput', input, solidityType, displayType);
  if (input === undefined || input === null) {
    if (solidityType.includes('[]')) {
      return [];
    }

    return undefined;
  }
  if (solidityType === 'address') {
    return isAddress(String(input)) ? String(input) : '';
  }
  const tsType = solidityToTypescriptType(solidityType);

  switch (tsType) {
    case 'number':
      return Number(input);
    case 'bigint':
      if (typeof input === 'bigint') {
        return input;
      }
      if (_.isObject(input)) {
        const numberFromObject = Math.floor(_.toNumber(input) / 1000);
        return convertToBigInt(numberFromObject);
      }
      if (_.isString(input) || _.isNumber(input)) {
        // TODO handle decimal number as string, crashing BigInt conversion
        return convertToBigInt(input);
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
      return String(input)
        .split(',')
        .map((num) => convertToBigInt(num.trim()));
    case 'string[]':
      if (solidityType === 'address[]') {
        return Array.isArray(input) ? _.compact(input) : [];
      }
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
  console.log('transformAndVerify', input, solidityType);
  const transformedInput = transformInput(input, solidityType);

  if (verify(transformedInput, solidityType)) {
    return true;
  }

  // TODO pass a more specific error message for types
  return typeof transformedInput === 'string' && transformedInput !== ''
    ? transformedInput
    : 'This is not a valid input!';
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

export function commify(value: number | string) {
  const match = _.toString(value).match(/^(-?)([0-9]*)(\.?)([0-9]*)$/);
  if (!match || (!match[2] && !match[4])) {
    throw new Error(`bad formatted number: ${JSON.stringify(value)}`);
  }

  const neg = match[1];
  const whole = BigInt(match[2] || 0).toLocaleString('en-us');
  // const frac = match[4] ? match[4].match(/^(.*?)0*$/)[1] : '0';

  return `${neg}${whole}`;
  // return `${neg}${whole}.${frac}`;
}

export function getHostnameFromURL(urlString?: string) {
  if (!urlString) return '';
  try {
    return new URL(urlString).hostname;
  } catch (error) {
    return '';
  }
}

const defaultValuesMapping = {
  number: 0,
  bigint: BigInt(0),
  string: '',
  boolean: false,
  'number[]': [],
  'bigint[]': [],
  'string[]': [],
  'boolean[]': [],
  unknown: null,
};

export const getDefaultValue = (type: ArgumentTsType) =>
  defaultValuesMapping[type];
