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

export const explorerUrl = (chainId: number) => {
  const explorerUrls: { [key: number]: string } = {
    1: 'https://etherscan.io',
    5: 'https://goerli.etherscan.io',
    10: 'https://optimistic.etherscan.io',
    100: 'https://gnosisscan.io',
    137: 'https://polygonscan.com',
    42161: 'https://arbiscan.io',
    11155111: 'https://sepolia.etherscan.io',
  };

  return explorerUrls[chainId] || explorerUrls[5];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const clearNonObjects = (array: any[]) => {
  return _.filter(array, (item) => typeof item === 'object');
};

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
  let isImage = false;
  if (typeof url === 'string' && url?.startsWith('http')) {
    try {
      isImage = await fetchWithTimeout(url, { method: 'HEAD' })
        .then((res) => {
          if (!res.ok) {
            throw new Error();
          }
          return res.headers?.get('Content-Type')?.startsWith('image') || false;
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

export const mapWithChainId = (trees: any[] | null, chainId: number) =>
  _.map(trees, (tree) => ({ ...tree, chainId }));
