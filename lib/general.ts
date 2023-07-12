import _ from 'lodash';

export function parseUri(uri: string) {
  const parsed = JSON.parse(uri);
  return parsed;
}

export function decodeUri(uri: string) {
  const decoded = Buffer.from(uri.substring(29), 'base64').toString('utf8');
  return decoded;
}

export const formatAddress = (address: string | undefined) =>
  address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const clearNonObjects = (array: any[]) => {
  return _.filter(array, (item) => typeof item === 'object');
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

export const mapWithChainId = (array: object[] | null, chainId: number) =>
  _.map(array, (obj: object) => ({ ...obj, chainId }));

export const containsUpperCase = (string: string) => /\p{Lu}/u.test(string);

export const validateURL = (textval: string) => {
  const urlregex =
    /^((http|https):\/\/)?([w|W]{3}\.)+[a-zA-Z0-9\-.]{3,}\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/;
  return urlregex.test(textval);
};
