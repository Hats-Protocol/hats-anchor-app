import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';

import { AUTHORITY_TYPES } from '@/constants';
import { decimalId } from '@/lib/hats';

const fetchSpaces = async (spaces?: string[]) => {
  if (!spaces || spaces.length === 0) {
    return [];
  }

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
      variables: { ids: spaces },
    }),
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }

  const result = await response.json();
  return result.data.spaces;
};

const useSpaces = ({
  spaces,
  hatId,
  chainId,
  editMode = false,
}: {
  spaces?: string[];
  hatId?: string;
  chainId?: number;
  editMode?: boolean;
}) => {
  const { data, error, isLoading } = useQuery({
    queryKey: ['spaces', spaces],
    queryFn: () => fetchSpaces(spaces),
    enabled: spaces && spaces.length > 0,
    staleTime: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
  });

  const selectedHatSpaceStrategies = data
    ? _.compact(
        _.map(data, (space) => {
          const filteredStrategies = _.filter(
            space.strategies,
            (strategy) =>
              _.includes(strategy.params.ids, decimalId(hatId)) &&
              Number(strategy.network) === chainId,
          );

          return !_.isEmpty(filteredStrategies)
            ? {
                label: space.name,
                link: `https://snapshot.org/#/${space.id}`,
                description: space.about,
                imageUrl: '/img/snapshot.jpeg',
                type: AUTHORITY_TYPES.token,
                id: 'snapshot',
                strategies: filteredStrategies,
              }
            : null;
        }),
      )
    : [];

  return { selectedHatSpaceStrategies, error, loading: isLoading };
};

export default useSpaces;
