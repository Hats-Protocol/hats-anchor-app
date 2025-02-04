import { useQuery } from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { get, isEmpty } from 'lodash';
import { ExtendedHSGV2, SupportedChains } from 'types';
import { ancillarySubgraphClient } from 'utils';
import { Hex } from 'viem';

const COUNCILS_LIST_QUERY = gql`
  query CouncilsList($hatIds: [String!]!) {
    hatsSignerGateV2S(where: { signerHats_: { id_in: $hatIds } }) {
      id
      ownerHat {
        id
      }
      safe
      signerHats {
        id
      }
    }
  }
`;

const fetchCouncilsList = async (hatIds: Hex[], chainId: number | undefined) => {
  if (!chainId) return Promise.resolve(null);

  const client = ancillarySubgraphClient(chainId as SupportedChains);
  if (!client) return Promise.resolve(null);
  const variables = { hatIds };
  const result = await client.request(COUNCILS_LIST_QUERY, variables);

  return Promise.resolve((get(result, 'hatsSignerGateV2S') || null) as ExtendedHSGV2[] | null);
};

const useCouncilsList = ({ hatIds, chainId }: UseCouncilsListProps) => {
  return useQuery({
    queryKey: ['councils', { hatIds, chainId }],
    queryFn: () => fetchCouncilsList(hatIds, chainId),
    enabled: !isEmpty(hatIds) && !!chainId,
  });
};

interface UseCouncilsListProps {
  hatIds: Hex[];
  chainId: number | undefined;
}

export { useCouncilsList };
