import { usePrivy } from '@privy-io/react-auth';
import { useQuery } from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { get } from 'lodash';
import { CouncilMember } from 'types';
import { getCouncilsGraphqlClient } from 'utils';

// TODO support safe or id
// TODO handle chainId
const GET_COUNCIL = gql`
  query getCouncil($id: String!) {
    council(hsg: $id) {
      id
      memberSelectionModule
      memberCriteriaModule
      org {
        name
      }
    }
  }
`;

const getOffchainCouncilData = async ({
  id,
  chainId,
  accessToken,
}: {
  id: string;
  chainId: number;
  accessToken: string | null;
}) => {
  return getCouncilsGraphqlClient(accessToken ?? undefined)
    .request<{
      updateUser: CouncilMember;
    }>(GET_COUNCIL, { id, chainId })
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
  const { getAccessToken } = usePrivy();

  return useQuery({
    queryKey: ['offchainCouncilData', chainId, id],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      return getOffchainCouncilData({ id, chainId, accessToken });
    },
  });
};
