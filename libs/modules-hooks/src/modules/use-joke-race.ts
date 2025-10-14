import { useQuery } from '@tanstack/react-query';
import { get } from 'lodash';
import { JokeRaceTerm, SupportedChains } from 'types';
import { createMeshClient, getJokeRaceQuery, NETWORKS_PREFIX } from 'utils';
import { Hex } from 'viem';

const fetchJokeRace = async (moduleId: Hex | undefined, chainId: SupportedChains | undefined) => {
  if (!moduleId || !chainId) return null;

  try {
    const client = createMeshClient();
    const query = getJokeRaceQuery(chainId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await client.request(query, { moduleId });

    const networkPrefix = NETWORKS_PREFIX[chainId];
    return get(response, `${networkPrefix}_jokeRaceEligibility.currentTerm`, null) as JokeRaceTerm | null;
  } catch (error) {
    return null;
  }
};

const useJokeRace = ({ chainId, moduleId }: { chainId: SupportedChains | undefined; moduleId: Hex | undefined }) => {
  return useQuery({
    queryKey: ['jokeRace', { chainId, moduleId }],
    queryFn: () => fetchJokeRace(moduleId, chainId),
  });
};

export { useJokeRace };
