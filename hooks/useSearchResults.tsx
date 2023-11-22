import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';

import { decimalIdToId, ipToPrettyId, toTreeId } from '@/lib/hats';
import { searchQueryResult } from '@/lib/subgraph';

// TODO refactor without prettyId

// app-hooks
const useSearchResults = ({ search }: { search: string | undefined }) => {
  let localSearch = toTreeId(search);
  if (_.includes(search, '.')) {
    localSearch = ipToPrettyId(search);
  }
  if (_.gt(_.size(search), 10) && !_.startsWith(search, '0x')) {
    localSearch = decimalIdToId(Number(search));
  }

  const { status, error, data, isLoading } = useQuery({
    queryKey: ['searchResults', localSearch],
    queryFn: () => searchQueryResult(localSearch),
    enabled: !!localSearch && localSearch !== '0x',
    refetchInterval: 1000 * 60 * 60 * 24,
  });

  return { status, error, data, isLoading };
};

export default useSearchResults;
