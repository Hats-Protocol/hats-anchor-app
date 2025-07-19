import { compact, concat, get, includes, toNumber, uniqBy } from 'lodash';
import { CouncilFormData, ExtendedHSGV2, OffchainCouncilData } from 'types';
import { Address, getAddress, Hex } from 'viem';

import { chainStringToId } from '../chains';
import { GET_COUNCIL_BY_HSG, getCouncilsGraphqlClient } from '../councils-gql';
import { logger } from '../logs';

export * from './form';

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

export const slugify = (name: string) => {
  return name.toLowerCase().replace(/ /g, '-');
};

/**
 * Parse an organization slug back to its original name with proper capitalization
 * @param slug The organization slug to parse
 * @returns The organization name with proper capitalization
 */
export const parseOrganizationSlug = (slug: string): string => {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const parseCouncilSlug = (slug: string) => {
  if (includes(slug, '%3A')) {
    const [chain, address] = slug.split('%3A');

    if (!chain || !address) {
      return { chainId: null, address: slug };
    }

    try {
      return { chainId: checkChainId(chain), address: getAddress(address) };
    } catch (error) {
      logger.error('Error parsing council slug', error);
      return { chainId: checkChainId(chain), address };
    }
  }

  if (includes(slug, ':')) {
    const [chain, address] = slug.split(':');

    if (!chain || !address) {
      return { chainId: null, address: slug };
    }

    try {
      return { chainId: checkChainId(chain), address: getAddress(address) };
    } catch (error) {
      logger.error('Error parsing council slug', error);
      return { chainId: checkChainId(chain), address };
    }
  }

  return { chainId: null, address: slug };
};

export const getAllWearers = (councilDetails: CouncilFormData | undefined) => {
  if (!councilDetails) return [];

  return uniqBy(
    compact(
      concat(
        councilDetails.admins,
        councilDetails.complianceAdmins,
        councilDetails.agreementAdmins,
        councilDetails.members,
      ),
    ),
    'address',
  );
};

export const getOffchainCouncilData = async ({
  hsg,
  // safe,
  chainId,
  accessToken,
}: {
  hsg?: string;
  // safe?: string;
  chainId: number | undefined;
  accessToken: string | null;
}): Promise<OffchainCouncilData | null> => {
  if (!hsg || !chainId) return Promise.resolve(null);
  // TODO handle safe
  return getCouncilsGraphqlClient(accessToken ?? undefined)
    .request<{
      councils: OffchainCouncilData[];
    }>(GET_COUNCIL_BY_HSG, { hsg, chainId })
    .then((data) => {
      return Promise.resolve(get(data, 'councils[0]', null));
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Error fetching offchain council data', error);
      return Promise.resolve(null);
    });
};

interface BatchCouncil {
  hsg: Hex;
  chainId: number;
}

export const getBatchOffchainCouncilData = async ({
  council,
  accessToken,
}: {
  council: BatchCouncil;
  accessToken: string | null;
}): Promise<OffchainCouncilData | null> => {
  if (!council.hsg || !council.chainId) return Promise.resolve(null);

  const client = getCouncilsGraphqlClient(accessToken ?? undefined);

  return client
    .request<{
      councils: OffchainCouncilData[];
    }>(GET_COUNCIL_BY_HSG, { hsg: council.hsg, chainId: council.chainId })
    .then((data) => get(data, 'councils[0]', null))
    .catch((error) => {
      logger.error('Error fetching offchain council data', error);
      return null;
    });
};

export const currentThreshold = (
  councilDetails: ExtendedHSGV2 | null | undefined,
  safeSigners: Address[] | null | undefined,
) => {
  if (!councilDetails) return 0;
  if (councilDetails?.thresholdType === 'ABSOLUTE') {
    return Number(councilDetails?.minThreshold);
  }
  const targetThreshold = Number(councilDetails?.targetThreshold);
  if (!targetThreshold || isNaN(targetThreshold)) return 0;
  const thresholdPercentage = targetThreshold / 10000; // convert to percentage, base 10000
  if (!safeSigners || safeSigners.length === 0) return 0;
  const localThreshold = thresholdPercentage * safeSigners.length;
  return Math.round(localThreshold);
};
