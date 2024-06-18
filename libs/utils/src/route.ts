import {
  hatIdDecimalToHex,
  // hatIdDecimalToIp,
  hatIdIpToDecimal,
  // treeIdHexToDecimal,
} from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
import { ReadonlyURLSearchParams } from 'next/navigation';
// import { ParsedUrlQuery } from 'querystring';
import { SupportedChains } from 'types';
import { Hex } from 'viem';

export const getPathParams = (pathname: string) => {
  const pathArray = pathname.split('/');
  const ipId = _.nth(pathArray, 4);
  return {
    chainId: _.toNumber(_.nth(pathArray, 2)) as SupportedChains,
    treeId: _.toNumber(_.nth(pathArray, 3)),
    hatId: ipId ? hatIdDecimalToHex(hatIdIpToDecimal(ipId)) : undefined,
  };
};

export const getQueryParams = (params: ReadonlyURLSearchParams) => {
  const values = _.fromPairs(Array.from(params.entries()));

  return {
    chainId: _.toNumber(_.get(values, 'chainId')) as
      | SupportedChains
      | undefined,
    treeId: _.toNumber(_.get(values, 'treeId')),
    hatId: _.get(values, 'hatId') as Hex,
    flipped: _.get(values, 'flipped') === 'true',
    compact: _.get(values, 'compact') === 'true',
    collapsed: _.get(values, 'collapsed'),
  };
};

export const urlFromQueryParams = ({
  pathname,
  params,
  add,
  drop,
}: {
  pathname: string;
  params: any;
  add: object;
  drop: string[];
}) => {
  let query = params;

  if (!_.isEmpty(add)) {
    query = { ...query, ...add };
  }

  return `${pathname}?${new URLSearchParams(_.omit(query, drop))}`;
};

// export const getQueryRoute = ({
//   query,
//   pathname,
//   hat,
//   hatId,
//   treeId,
//   drop,
// }: {
//   query: ParsedUrlQuery;
//   pathname: string;
//   hat?: AppHat;
//   hatId?: Hex;
//   treeId?: Hex | number; // ? HEX? Should be a number?
//   drop?: { tree?: boolean; hat?: boolean };
// }) => {
//   let updatedQuery = query;

//   // maintain flipped or compact if set by user
//   const { flipped, compact } = _.pick(query, ['flipped', 'compact']);
//   if (compact === 'true') {
//     updatedQuery = { ...updatedQuery, compact: 'true' };
//   }
//   if (flipped === 'true') {
//     updatedQuery = { ...updatedQuery, flipped: 'true' };
//   }

//   // handle tree Id
//   if (hat?.treeId) {
//     updatedQuery = {
//       ...updatedQuery,
//       treeId: _.toString(treeIdHexToDecimal(hat.treeId)),
//     };
//   } else if (treeId) {
//     if (_.isNumber(treeId)) {
//       updatedQuery = { ...updatedQuery, treeId: _.toString(treeId) };
//     } else {
//       updatedQuery = { ...updatedQuery, treeId: hexToString(treeId as Hex) };
//     }
//   }

//   // handle hat Id
//   if (hat?.id) {
//     updatedQuery = {
//       ...updatedQuery,
//       hatId: hatIdDecimalToIp(BigInt(hat.id)),
//     };
//   } else if (hatId && hatId !== '0x') {
//     updatedQuery = { ...updatedQuery, hatId: hatIdDecimalToIp(BigInt(hatId)) };
//   }

//   // handle dropping values
//   if (drop?.hat) {
//     updatedQuery = _.omit(updatedQuery, 'hatId');
//   }
//   if (drop?.tree) {
//     updatedQuery = _.omit(updatedQuery, 'treeId');
//   }

//   return { pathname, query: updatedQuery };
// };
