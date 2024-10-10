import { useQuery } from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { get, toLower } from 'lodash';
import { HatAuthorityResponse, SupportedChains } from 'types';
import { ancillarySubgraphClient } from 'utils';

const AGREEMENT_QUERY = gql`
  query GetModuleAuthorities($id: ID!) {
    agreementEligibility(id: $id) {
      agreements(orderBy: graceEndTime, orderDirection: desc, first: 1) {
        graceEndTime
        signers
      }
      badStandings
    }
  }
`;

const fetchAgreement = async ({
  id,
  chainId,
}: {
  id: string | undefined;
  chainId: SupportedChains | undefined;
}) => {
  if (!id || !chainId) return null;

  try {
    const client = ancillarySubgraphClient(chainId);
    if (!client) return null;
    const response = await client.request<HatAuthorityResponse>(
      AGREEMENT_QUERY,
      { id: toLower(id) },
    );
    // only returning "last" (most recent) agreement
    return get(response, 'agreementEligibility')
      ? get(response, 'agreementEligibility')
      : null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching ancillary modules:', error);
    return null;
  }
};

const useAgreement = ({
  id,
  chainId,
}: {
  id: string | undefined;
  chainId: SupportedChains | undefined;
}) => {
  return useQuery({
    queryKey: ['agreementDetails', { id, chainId }],
    queryFn: () => fetchAgreement({ id, chainId }),
    enabled: !!id && !!chainId, // TODO check if module is agreement module
  });
};

export default useAgreement;
