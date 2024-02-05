// useProposalDetails.ts
import { useQuery } from '@tanstack/react-query';
import { gql, request } from 'graphql-request';

const fetchProposalDetails = async (proposalId: string) => {
  const query = gql`
    query {
      proposal(id: "${proposalId}") {
        id
        title
        body
        choices
        start
        end
        snapshot
        state
        author
        created
        scores
        scores_by_strategy
        scores_total
        scores_updated
        plugins
        network
        strategies {
          name
          network
          params
        }
        space {
          id
          name
        }
      }
    }
  `;

  const endpoint = 'https://hub.snapshot.org/graphql';
  const data = (await request(endpoint, query)) as any;
  return data.proposal;
};

const useProposalDetails = (proposalId: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['proposalDetails', proposalId],
    queryFn: () => fetchProposalDetails(proposalId),
  });

  return { data, isLoading, error };
};

export default useProposalDetails;
