import { hatIdDecimalToHex, hatIdIpToDecimal } from '@hatsprotocol/sdk-v1-core';
import _, { concat, first, get, has, isArray, isEmpty, isNaN, isString, isUndefined, map, omit, omitBy, split, toNumber, toPairs } from 'lodash';
import { ReadonlyURLSearchParams } from 'next/navigation';
import { SupportedChains } from 'types';
import { Hex } from 'viem';

const EXCLUDE_ROUTES = ['_next', 'api'];

export const getPathParams = (pathname: string) => {
  const pathArray = pathname.split('/');

  // TODO fix if want to use on API routes
  const firstPath = _.nth(pathArray, 1);
  if (_.includes(EXCLUDE_ROUTES, firstPath)) {
    // being run on all routes so exclude some
    return { chainId: 1 as SupportedChains };
  }

  if (firstPath === 'wearers') {
    return {
      chainId: 10 as SupportedChains,
      wearer: _.nth(pathArray, 2) as Hex,
    };
  }
  // works for /trees/1/1/1
  const chainId = (_.toNumber(_.nth(pathArray, 2)) || 1) as SupportedChains;

  const ipId = _.nth(pathArray, 4);
  if (isNaN(toNumber(first(split(ipId, '.'))))) {
    return {
      chainId,
      treeId: undefined,
      hatId: undefined,
    };
  }
  return {
    chainId,
    treeId: _.nth(pathArray, 3) ? _.toNumber(_.nth(pathArray, 3)) : undefined,
    hatId: ipId ? hatIdDecimalToHex(hatIdIpToDecimal(ipId)) : undefined,
  };
};

export const getQueryParams = (params: ReadonlyURLSearchParams) => {
  const values = _.fromPairs(Array.from(params.entries()));

  return {
    chainId: (_.get(values, 'chainId')
      ? _.toNumber(_.get(values, 'chainId'))
      : undefined) as SupportedChains | undefined,
    treeId: _.get(values, 'treeId')
      ? _.toNumber(_.get(values, 'treeId'))
      : undefined,
    hatId: _.get(values, 'hatId') as Hex,
    flipped: _.get(values, 'flipped') === 'true',
    compact: _.get(values, 'compact') === 'true',
    collapsed: params.getAll('collapsed'),
  };
};

const handleCollapsedQueryParams = (
  pathname: string,
  query: object,
  collapsed: string | Array<string> | undefined,
) => {
  if (isUndefined(collapsed) || isEmpty(collapsed) || collapsed === '')
    return `${pathname}?${new URLSearchParams(toPairs(query))}`;

  if (isString(collapsed)) {
    return `${pathname}?${new URLSearchParams(
      concat(toPairs(query), [['collapsed', collapsed]]),
    )}`;
  }

  const localQuery = _.concat(
    toPairs(omit(query, 'collapsed')) as [string, string][],
    map(collapsed, (v) => ['collapsed', v]) as [string, string][],
  );

  return `${pathname}?${new URLSearchParams(localQuery)}`;
};

export const urlFromQueryParams = ({
  pathname,
  params,
  add = {},
  drop = [],
}: {
  pathname: string;
  params: object;
  add?: object;
  drop?: string[];
}) => {
  let query = params;

  // remove keys where the value is undefined or false
  query = omitBy(query, isUndefined);
  query = omitBy(query, (value) => value === false);
  query = omitBy(query, isEmpty); // remove keys where the array is empty

  // always drop these keys, being used elsewhere in the app here
  query = omit(query, concat(drop, ['treeId', 'chainId']));
  const queryCollapsed = get(query, 'collapsed'); // collapsed exists and is not empty array

  if (has(add, 'collapsed')) {
    // handle collapsed separately since incompatible with object keys
    const restAdd = omit(add, 'collapsed') || {};
    const queryWithoutCollapsed = omit(query, 'collapsed');
    query = { ...queryWithoutCollapsed, ...restAdd };

    // collapsed should be passed as the expected current state
    const collapsed = get(add, 'collapsed');

    if (
      (isString(collapsed) && !isUndefined(collapsed)) ||
      (isArray(collapsed) && !isEmpty(collapsed))
    ) {
      return handleCollapsedQueryParams(pathname, queryWithoutCollapsed, collapsed);
    }
  }

  // don't leave the trailing `?` if no query params
  if (isEmpty(query)) return pathname;

  return handleCollapsedQueryParams(pathname, query, queryCollapsed);
};
