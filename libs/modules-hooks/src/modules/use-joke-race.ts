import { useQuery } from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { get } from 'lodash';
import { JokeRaceTerm, SupportedChains } from 'types';
import { ancillarySubgraphClient } from 'utils';
import { Hex } from 'viem';

const jokeRaceQuery = gql`
  query JokeRaceEligibility($moduleId: String!) {
    jokeRaceEligibility(id: $moduleId) {
      currentTerm {
        contest
        termEndsAt
        topK
        transitionPeriod
        winners
      }
    }
  }
`;

const fetchJokeRace = async (moduleId: Hex | undefined, chainId: SupportedChains | undefined) => {
  if (!moduleId || !chainId) return null;
  const client = ancillarySubgraphClient(chainId);

  if (!client) return null;

  const response = await client.request(jokeRaceQuery, {
    moduleId,
  });

  return get(response, 'jokeRaceEligibility.currentTerm', null) as JokeRaceTerm | null;
};

const useJokeRace = ({ chainId, moduleId }: { chainId: SupportedChains | undefined; moduleId: Hex | undefined }) => {
  return useQuery({
    queryKey: ['jokeRace', { chainId, moduleId }],
    queryFn: () => fetchJokeRace(moduleId, chainId),
  });
};

export { useJokeRace };
