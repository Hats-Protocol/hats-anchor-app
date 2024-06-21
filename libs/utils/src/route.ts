import { hatIdDecimalToHex, hatIdIpToDecimal } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
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

  const ipId = _.nth(pathArray, 4);
  return {
    chainId: (_.toNumber(_.nth(pathArray, 2)) || 1) as SupportedChains,
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

const handleCollapsedAdded = (
  pathname: string,
  query: object,
  collapsed: string | Array<string>,
) => {
  if (_.isEmpty(collapsed) || collapsed === '')
    return `${pathname}?${new URLSearchParams(_.toPairs(query))}`;

  if (_.isString(collapsed)) {
    return `${pathname}?${new URLSearchParams(
      _.concat(_.toPairs(query), [['collapsed', collapsed]]),
    )}`;
  }

  const localQuery = _.concat(
    _.toPairs(_.omit(query, 'collapsed')) as [string, string][],
    _.map(collapsed, (v) => ['collapsed', v]) as [string, string][],
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
  query = _.omitBy(query, _.isUndefined);
  query = _.omitBy(query, (value) => value === false);

  // always drop these keys, being used elsewhere in the app here
  query = _.omit(query, _.concat(drop, ['treeId', 'chainId']));

  // handle collapsed separately since incompatible with object keys
  const restAdd = _.omit(add, 'collapsed') || {};
  const queryWithoutCollapsed = _.omit(query, 'collapsed');
  query = { ...queryWithoutCollapsed, ...restAdd };

  // handle collapsed, concatenate with existing collapsed if present
  const collapsed = _.compact(
    _.concat(
      _.get(params, 'collapsed', []),
      _.flatten([_.get(add, 'collapsed')]),
    ),
  ) as unknown as string[];
  if (
    (_.isString(collapsed) && !_.isUndefined(collapsed)) ||
    (_.isArray(collapsed) && !_.isEmpty(collapsed))
  ) {
    return handleCollapsedAdded(pathname, queryWithoutCollapsed, collapsed);
  }

  // don't leave the trailing `?` if no query params
  if (_.isEmpty(query)) return pathname;

  return `${pathname}?${new URLSearchParams(_.toPairs(query))}`;
};
