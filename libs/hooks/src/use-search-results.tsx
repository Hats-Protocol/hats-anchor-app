'use client';

import { hatIdDecimalToHex, hatIdDecimalToIp, hatIdIpToDecimal } from '@hatsprotocol/sdk-v1-core';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { searchQueryResult } from 'utils';
import { numberToHex } from 'viem';

const isValidSearch = (search: string | undefined) => {
  if (
    (search?.startsWith('0x') && search !== '0x') ||
    (!_.isNaN(_.toNumber(search)) && _.toNumber(search) !== 0) ||
    _.every(_.split(search, '.'), (v: string) => !_.isNaN(_.toNumber(v))) ||
    _.endsWith(search, '.')
  )
    return true;
  return false;
};

const DEFAULT_SEARCH_RETURN = {
  subgraphSearch: undefined,
  searchKey: undefined,
};

const processSearchQuery = (search: string | undefined) => {
  if (!search) return DEFAULT_SEARCH_RETURN;
  if (!isValidSearch(search)) return { subgraphSearch: search, searchKey: search };

  if (!_.includes(search, '.')) {
    // tree ID integer search
    const subgraphSearch = numberToHex(_.toNumber(search), {
      size: 4,
    }) as string;
    return { subgraphSearch, searchKey: search };
  }

  if (_.startsWith(search, '0x')) {
    // standard hex search

    return {
      subgraphSearch: search,
      searchKey: hatIdDecimalToIp(BigInt(search)),
    };
  }

  if (_.includes(search, '.') && !_.endsWith(search, '.')) {
    // ip search // TODO more rigorous valid IP ID check
    let subgraphSearch = search;
    const decimalId = hatIdIpToDecimal(search);

    if (decimalId) {
      subgraphSearch = hatIdDecimalToHex(decimalId);
    }

    return {
      subgraphSearch,
      searchKey: hatIdDecimalToIp(decimalId),
    };
  }

  if (_.gt(_.size(search), 10) && !_.startsWith(search, '0x')) {
    // full decimal search
    const subgraphSearch = hatIdDecimalToHex(BigInt(search));

    return {
      subgraphSearch,
      searchKey: search, // hatIdDecimalToIp(hatIdHexToDecimal(subgraphSearch)),
    };
  }

  return DEFAULT_SEARCH_RETURN;
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

export { useSearchResults };
