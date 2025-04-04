import { compact, concat, get, includes, toNumber, uniqBy } from 'lodash';
import { OffchainCouncilData } from 'types';
import { getAddress, Hex } from 'viem';

import { chainStringToId } from '../chains';
import { GET_COUNCIL_BY_HSG, getCouncilsGraphqlClient } from '../councils-gql';

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

    // TODO check isAddress first here - https://hats-protocol.sentry.io/issues/6311299196
    try {
      return { chainId: checkChainId(chain), address: getAddress(address) };
    } catch (error) {
      return { chainId: checkChainId(chain), address };
    }
  }

  if (includes(slug, ':')) {
    const [chain, address] = slug.split(':');

    if (!chain || !address) {
      return { chainId: null, address: slug };
    }

    // TODO check isAddress first here - https://hats-protocol.sentry.io/issues/6311299196
    try {
      return { chainId: checkChainId(chain), address: getAddress(address) };
    } catch (error) {
      return { chainId: checkChainId(chain), address };
    }
  }

  return { chainId: null, address: slug };
};

export const getAllWearers = (offchainCouncilDetails: OffchainCouncilData | undefined) => {
  if (!offchainCouncilDetails) return [];

  return uniqBy(
    compact(
      concat(
        get(offchainCouncilDetails, 'creationForm.admins'),
        get(offchainCouncilDetails, 'creationForm.complianceAdmins'),
        get(offchainCouncilDetails, 'creationForm.agreementAdmins'),
        get(offchainCouncilDetails, 'creationForm.members'),
      ),
    ),
    'address',
  );
};

export const getOffchainCouncilData = async ({
  hsg,
  safe,
  chainId,
  accessToken,
}: {
  hsg?: string;
  safe?: string;
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
      console.error('Error fetching offchain council data', error);
      return null;
    });
};
