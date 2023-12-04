import { hatIdDecimalToIp, hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';

import { decimalIdToId, ipToPrettyId, toTreeId } from '../lib/hats';
import { searchQueryResult } from '../lib/subgraph/search';

// TODO refactor without prettyId

const processSearchQuery = (search: string | undefined) => {
  // standard hex search
  let localSearch = toTreeId(search);
  let searchKey = search;

  if (_.includes(search, '.')) {
    // ip search
    localSearch = ipToPrettyId(search);
  } else if (_.gt(_.size(search), 10) && !_.startsWith(search, '0x')) {
    // decimal search
    localSearch = decimalIdToId(Number(search));
    searchKey = hatIdDecimalToIp(hatIdHexToDecimal(localSearch));
  }

  return { subgraphSearch: localSearch, searchKey };
};

// app-hooks
const useSearchResults = ({ search }: { search: string | undefined }) => {
  const { subgraphSearch: localSearch, searchKey } = processSearchQuery(search);

  const { status, error, data, isLoading } = useQuery({
    queryKey: ['searchResults', localSearch],
    queryFn: () => searchQueryResult(localSearch),
    enabled: !!localSearch && localSearch !== '0x',
    refetchInterval: 1000 * 60 * 60 * 24,
  });

  return {
    status,
    searchKey,
    error,
    data,
    isLoading,
  };
};

export default useSearchResults;
