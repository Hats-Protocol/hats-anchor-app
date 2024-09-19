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
  console.log('id', id, 'chainId', chainId);

  try {
    const client = ancillarySubgraphClient(chainId);
    if (!client) return null;
    const response = await client.request<HatAuthorityResponse>(
      AGREEMENT_QUERY,
      { id: toLower(id) },
    );
    console.log('response', response);
    // only returning "last" (most recent) agreement
    return get(response, 'agreementEligibility')
      ? get(response, 'agreementEligibility.agreements[0]')
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
    enabled: !!id && !!chainId,
  });
};

export default useAgreement;
