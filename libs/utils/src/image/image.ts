import { CONFIG, GATEWAY_TOKEN } from '@hatsprotocol/config';
import _ from 'lodash';

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
          return res.status === 200 || false;
          // headers are coming back empty as of late, is there another way to detect this?
          // return res.headers?.get('Content-Type')?.startsWith('image') || false;
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
    return `${CONFIG.ipfsGateway}${url?.slice(7)}?pinataGatewayToken=${GATEWAY_TOKEN}`;
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
