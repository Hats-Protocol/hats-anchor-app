import { useQuery } from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { get, map, toLower } from 'lodash';
import { HatAuthorityResponse, SupportedChains } from 'types';
import { ancillarySubgraphClient } from 'utils';

const ALLOWLIST_QUERY = gql`
  query GetModuleAuthorities($id: ID!) {
    allowListEligibility(id: $id) {
      eligibilityData {
        address
        eligible
        badStanding
      }
    }
  }
`;

interface RawAllowlist {
  address: string;
  eligible: boolean;
  badStanding: boolean;
}

const fetchAllowlist = async ({ id, chainId }: { id: string | undefined; chainId: SupportedChains | undefined }) => {
  if (!id || !chainId) return null;

  try {
    const client = ancillarySubgraphClient(chainId);
    if (!client) return null;
    const response = await client.request<HatAuthorityResponse>(ALLOWLIST_QUERY, { id: toLower(id) });

    const result = get(response, 'allowListEligibility.eligibilityData') as RawAllowlist[] | undefined;

    if (!result) return null;

    return map(result, (member) => ({
      ...member,
      id: member.address as `0x${string}`, // additionally map to our wearer.id field
    }));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching ancillary modules:', error);
    return null;
  }
};

const useAllowlist = ({ id, chainId }: { id: string | undefined; chainId: SupportedChains | undefined }) => {
  return useQuery({
    queryKey: ['allowlistDetails', { id, chainId }],
    queryFn: () => fetchAllowlist({ id, chainId }),
    enabled: !!id && !!chainId,
  });
};

export { useAllowlist };
