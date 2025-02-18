import { compact, concat, get, includes, toNumber, uniqBy } from 'lodash';
import { OffchainCouncilData } from 'types';
import { getAddress } from 'viem';

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

export const parseCouncilSlug = (slug: string) => {
  if (includes(slug, '%3A')) {
    const [chain, address] = slug.split('%3A');

    if (!chain || !address) {
      return { chainId: null, address: slug };
    }

    return { chainId: checkChainId(chain), address: getAddress(address) };
  }

  if (includes(slug, ':')) {
    const [chain, address] = slug.split(':');

    if (!chain || !address) {
      return { chainId: null, address: slug };
    }

    return { chainId: checkChainId(chain), address: getAddress(address) };
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
