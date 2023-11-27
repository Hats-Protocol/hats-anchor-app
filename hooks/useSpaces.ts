import { useQuery } from '@tanstack/react-query';

// Function to fetch spaces data
const fetchSpaces = async (spaceIds: string[]) => {
  const response = await fetch('https://hub.snapshot.org/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        query GetSpaces($ids: [String!]!) {
          spaces(where: { id_in: $ids }) {
            id
            name
            about
            network
            symbol
            members
            strategies {
              name
              network
              params
            }
          }
        }
      `,
      variables: { ids: spaceIds },
    }),
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }

  const result = await response.json();
  return result.data.spaces;
};

// useSpaces hook using useQuery
const useSpaces = (spaceIds: string[]) => {
  const { data, error, isLoading } = useQuery({
    queryKey: ['spaces', spaceIds], // Use a unique key for caching
    queryFn: () => fetchSpaces(spaceIds),
    enabled: spaceIds.length > 0, // Fetch only if spaceIds are provided
  });

  return { data, error, loading: isLoading };
};

export default useSpaces;
