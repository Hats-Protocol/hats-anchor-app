import { useQuery } from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { get } from 'lodash';
import { CouncilMember } from 'types';
import { councilsGraphqlClient } from 'utils';

// TODO support safe or id
// TODO handle chainId
const GET_COUNCIL = gql`
  query getCouncil($id: ID!) {
    # council(where: { hsg: $id }) {
    council(id: $id) {
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
  id,
  chainId,
}: {
  id: string;
  chainId: number;
}): Promise<OffchainCouncilData | null> => {
  return councilsGraphqlClient
    .request<{
      council: OffchainCouncilData;
    }>(GET_COUNCIL, { id }) // { id, chainId }) // TODO
    .then((data) => {
      console.log(data);
      return get(data, 'council', null);
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Error fetching offchain council data', error);
      return null;
    });
};

export const useOffchainCouncilDetails = ({ id, chainId }: { id: string; chainId: number }) => {
  return useQuery({
    queryKey: ['offchainCouncilData', chainId, id],
    queryFn: () => getOffchainCouncilData({ id, chainId }),
  });
};
