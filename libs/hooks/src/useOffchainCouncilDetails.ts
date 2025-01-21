import { useQuery } from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { get } from 'lodash';
import type { OffchainCouncilData } from 'types';
import { councilsGraphqlClient } from 'utils';

const MEMBER_FRAGMENT = gql`
  fragment MemberFragment on User {
    id
    name
  }
`;

// TODO support safe or id
const GET_COUNCIL = gql`
  query getCouncil($hsg: String, $chainId: Int!) {
    councils(where: { hsg: $hsg, chain: $chainId }) {
      id
      hsg
      membersSelectionModule
      membersCriteriaModule
      creationForm {
        councilName
        councilDescription
        members {
          ...MemberFragment
        }
        admins {
          ...MemberFragment
        }
        agreementAdmins {
          ...MemberFragment
        }
        complianceAdmins {
          ...MemberFragment
        }
      }
      organization {
        name
      }
    }
  }
  ${MEMBER_FRAGMENT}
`;

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
      councils: OffchainCouncilData[];
    }>(GET_COUNCIL, { hsg, chainId })
    .then((data) => {
      return get(data, 'councils[0]', null);
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
    enabled: !!hsg && !!chainId,
  });
};
