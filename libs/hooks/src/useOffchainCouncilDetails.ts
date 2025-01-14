import { useQuery } from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { get } from 'lodash';
// import { CouncilMember } from 'types';
import { councilsGraphqlClient } from 'utils';

// TODO support safe or id
const GET_COUNCIL = gql`
  query getCouncil($hsg: String, $chainId: Int!) {
    councils(where: { hsg: $hsg, chain: $chainId }) {
      id
      hsg
      membersSelectionModule
      membersCriteriaModule
      # org {
      #   name
      # }
      # // council form fields
    }
  }
`;

type OffchainCouncilData = {
  id: string;
  hsg: string;
  membersSelectionModule: string;
  membersCriteriaModule: string;
};

const getOffchainCouncilData = async ({
  hsg,
  safe,
  chainId,
}: {
  hsg?: string;
  safe?: string;
  chainId: number;
}): Promise<OffchainCouncilData | null> => {
  // TODO handle safe
  return councilsGraphqlClient
    .request<{
      council: OffchainCouncilData;
    }>(GET_COUNCIL, { hsg, chainId })
    .then((data) => {
      return get(data, 'councils.[0]', null);
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Error fetching offchain council data', error);
      return null;
    });
};

export const useOffchainCouncilDetails = ({ hsg, chainId }: { hsg: string; chainId: number }) => {
  return useQuery({
    queryKey: ['offchainCouncilData', { chainId, hsg }],
    queryFn: () => getOffchainCouncilData({ hsg, chainId }),
  });
};
