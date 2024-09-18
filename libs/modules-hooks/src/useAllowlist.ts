import { useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { get, toLower } from "lodash";
import { HatAuthorityResponse, SupportedChains } from "types";
import { ancillarySubgraphClient } from "utils";


const ALLOWLIST_QUERY = gql`
  query GetModuleAuthorities($id: ID!) {
    allowListEligibility(id: $id){
      eligibilityData {
        address
        eligible
        badStanding
      }
    }
  }
`;

const fetchAllowlist = async ({ id, chainId }: { id: string | undefined; chainId: SupportedChains | undefined }) => {
  if (!id || !chainId) return null;

  try {
    const client = ancillarySubgraphClient(chainId);
    if (!client) return null;
    const response = await client.request<HatAuthorityResponse>(ALLOWLIST_QUERY, {
      id: toLower(id),
    });
    return get(response, 'allowListEligibility') ? get(response, 'allowListEligibility.eligibilityData') : null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching ancillary modules:', error);
    return null;
  }
}

const useAllowlist = ({ id, chainId }: { id: string | undefined; chainId: SupportedChains | undefined }) => {
  return useQuery({
    queryKey: ['allowlist', { id, chainId }],
    queryFn: () => fetchAllowlist({ id, chainId }),
    enabled: !!id && !!chainId,
  });
}

export default useAllowlist;