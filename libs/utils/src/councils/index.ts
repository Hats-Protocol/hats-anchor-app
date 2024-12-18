import { includes, toNumber } from 'lodash';

import { chainStringToId } from '../chains';

const checkChainId = (chain: string) => {
  const attemptNumber = toNumber(chain);
  if (typeof attemptNumber === 'number' && !isNaN(attemptNumber)) {
    return attemptNumber;
  }

  const chainId = chainStringToId(chain);
  if (chainId) {
    return chainId;
  }

  return null;
};

export const parseCouncilSlug = (slug: string) => {
  if (includes(slug, '%3A')) {
    const [chain, address] = slug.split('%3A');

    if (!chain || !address) {
      return { chainId: null, address: slug };
    }

    return { chainId: checkChainId(chain), address };
  }

  if (includes(slug, ':')) {
    const [chain, address] = slug.split(':');

    if (!chain || !address) {
      return { chainId: null, address: slug };
    }

    return { chainId: checkChainId(chain), address };
  }

  return { chainId: null, address: slug };
};
