import { useQuery } from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { get } from 'lodash';
import { CouncilMember } from 'types';
import { councilsGraphqlClient } from 'utils';

// TODO support safe or id
// TODO handle chainId
const GET_COUNCIL = gql`
  query getCouncil {
    # council(where: { hsg: $id }) {
    council(id: "cm5nwysyo00081tfnoao49rp5") {
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

const getOffchainCouncilData = async ({ id, chainId }: { id: string; chainId: number }) => {
  return councilsGraphqlClient
    .request<{
      updateUser: CouncilMember;
    }>(GET_COUNCIL) // { id, chainId })
    .then((data) => {
      console.log('getOffchainCouncilData - result', data);
      return get(data, 'council');
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
