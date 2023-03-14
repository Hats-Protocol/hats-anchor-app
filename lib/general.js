import _ from 'lodash';

export function parseUri(uri) {
  const parsed = JSON.parse(uri);
  return parsed;
}

export function decodeUri(uri) {
  const decoded = Buffer.from(uri.substring(29), 'base64').toString('utf8');
  return decoded;
}

export const formatAddress = (address) =>
  address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

export const explorerUrl = (chainId) => {
  const explorerUrls = {
    1: 'https://etherscan.io',
    5: 'https://goerli.etherscan.io',
    100: 'https://gnosisscan.io',
    137: 'https://polygonscan.com',
  };

  return explorerUrls[chainId] || explorerUrls[5];
};

export const clearNonObjects = (array) => {
  return _.filter(array, (item) => typeof item === 'object');
};

async function fetchWithTimeout(resource, options = {}) {
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
export async function isImageUrl(url) {
  let isImage = false;
  if (url !== undefined && url.startsWith('http')) {
    try {
      isImage = await fetchWithTimeout(url, { method: 'HEAD' })
        .then((res) => {
          if (!res.ok) {
            throw new Error();
          }
          return res.headers.get('Content-Type').startsWith('image');
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.log(error);
          throw new Error(`Fetching ${url} failed`);
        });
    } catch (error) {
      isImage = false;
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }

  return isImage;
}

export const mapWithChainId = (trees, chainId) =>
  _.map(trees, (tree) => ({ ...tree, chainId }));
