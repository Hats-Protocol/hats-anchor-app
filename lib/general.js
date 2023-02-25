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
  };

  return explorerUrls[chainId] || explorerUrls[5];
};

export const clearNonObjects = (array) => {
  return _.filter(array, (item) => typeof item === 'object');
};

/**
 * checks if a url links to an image
 */
export async function isImageUrl(url) {
  let isImage = false;
  if (url !== undefined && url.startsWith('http')) {
    try {
      isImage = await fetch(url, { method: 'HEAD' })
        .then((res) => {
          if (!res.ok) {
            throw new Error();
          }
          return res.headers.get('Content-Type').startsWith('image');
        })
        .catch((error) => {
          throw new Error(`Fetching ${url} failed`);
        });
    } catch (error) {
      isImage = false;
      console.log(error);
    }
  }

  return isImage;
}
