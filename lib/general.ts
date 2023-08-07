import _ from 'lodash';

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

export const formatAddress = (address: string | undefined) =>
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

export const mapWithChainId = (
  array: object[] | null,
  chainId: number,
): any[] => _.map(array, (obj: object) => ({ ...obj, chainId }));

export const containsUpperCase = (string: string) => /\p{Lu}/u.test(string);

export const validateURL = (textVal: string) => {
  const urlRegex =
    /^((http|https):\/\/)(www\.)?[a-zA-Z0-9\-.]+(\.[a-zA-Z]{2,})+(\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;%=]*)?$/;
  return urlRegex.test(textVal);
};
