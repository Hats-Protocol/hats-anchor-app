import { useQuery } from '@tanstack/react-query';

interface SubgraphCheckResult {
  mainSubgraph: number | undefined;
  mainSubgraphOutOfSync: boolean;
  mainVersion: string | undefined;
  ancillarySubgraph: number | undefined;
  ancillarySubgraphOutOfSync: boolean;
  ancillaryVersion: string | undefined;
  chain: number;
}

const fetchSubgraphCheck = async (chainId: number): Promise<SubgraphCheckResult | undefined> => {
  if (!chainId) return;

  try {
    const response = await fetch(`/api/subgraph-check/${chainId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch subgraph check:', error);
    throw error;
  }
};

const useSubgraphCheck = (chainId: number) => {
  return useQuery({
    queryKey: ['subgraphCheck', chainId],
    queryFn: () => fetchSubgraphCheck(chainId),
  });
};

export { useSubgraphCheck };
