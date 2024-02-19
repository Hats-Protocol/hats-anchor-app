import {
  hatIdDecimalToHex,
  hatIdDecimalToIp,
  hatIdHexToDecimal,
  hatIdIpToDecimal,
} from '@hatsprotocol/sdk-v1-core';
import { useQuery } from '@tanstack/react-query';
import { searchQueryResult } from 'app-utils';
import _ from 'lodash';
import { numberToHex } from 'viem';

const isValidSearch = (search: string | undefined) => {
  if (
    (search?.startsWith('0x') && search !== '0x') ||
    (!_.isNaN(_.toNumber(search)) && _.toNumber(search) !== 0) ||
    _.every(_.split(search, '.'), (v: string) => !_.isNaN(_.toNumber(v)))
  )
    return true;
  return false;
};

const processSearchQuery = (search: string | undefined) => {
  if (!search) return { subgraphSearch: undefined, searchKey: undefined };
  if (!isValidSearch(search))
    return { subgraphSearch: search, searchKey: search };

  // tree ID integer search
  let localSearch = numberToHex(_.toNumber(search), { size: 4 }) as string;
  let searchKey = search;

  if (_.startsWith(search, '0x')) {
    // standard hex search
    localSearch = search;
    searchKey = hatIdDecimalToIp(BigInt(search));
  } else if (_.includes(search, '.')) {
    // ip search
    localSearch = hatIdDecimalToHex(hatIdIpToDecimal(search));
  } else if (_.gt(_.size(search), 10) && !_.startsWith(search, '0x')) {
    // full decimal search
    localSearch = hatIdDecimalToHex(BigInt(search));
    searchKey = hatIdDecimalToIp(hatIdHexToDecimal(localSearch));
  }

  return { subgraphSearch: localSearch, searchKey };
};

const useSearchResults = ({ search }: { search: string | undefined }) => {
  const { subgraphSearch: localSearch, searchKey } = processSearchQuery(search);
  const valid = isValidSearch(localSearch);

  const { status, error, data, isLoading } = useQuery({
    queryKey: ['searchResults', localSearch],
    queryFn: () => searchQueryResult(localSearch),
    enabled: !!localSearch && localSearch !== '0x' && valid,
    refetchInterval: 1000 * 60 * 60 * 24, // 24 hours
  });

  return {
    status,
    isValid: valid,
    searchKey,
    error,
    data: data as unknown,
    isLoading,
  };
};

export default useSearchResults;
