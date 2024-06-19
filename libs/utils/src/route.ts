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
  if (_.includes(EXCLUDE_ROUTES, firstPath))
    // being run on all routes so exclude some
    return { chainId: 1 as SupportedChains };

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
    collapsed: _.get(values, 'collapsed'),
  };
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
  console.log(pathname, params);

  if (!_.isEmpty(add)) {
    query = { ...query, ...add };
  }

  // remove keys where the value is undefined or false
  query = _.omitBy(query, _.isUndefined);
  query = _.omitBy(query, (value) => value === false);

  // always drop these keys, being used elsewhere in the app here
  query = _.omit(query, _.concat(drop, ['treeId', 'chainId']));

  // don't leave the trailing `?` if no query params
  if (_.isEmpty(_.keys(query))) return pathname;

  // convert query object to array of key value pairs that is compatible with URLSearchParams
  const queryArray = _.toPairs(query);

  return `${pathname}?${new URLSearchParams(queryArray)}`;
};
