import {
  hatIdDecimalToHex,
  // hatIdDecimalToIp,
  hatIdIpToDecimal,
  // treeIdHexToDecimal,
} from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
// import { ParsedUrlQuery } from 'querystring';
import { SupportedChains } from 'types';
// import { Hex, hexToString } from 'viem';

export const getPathParams = (pathname: string) => {
  const pathArray = pathname.split('/');
  const ipId = _.nth(pathArray, 4);
  return {
    chainId: _.toNumber(_.nth(pathArray, 2)) as SupportedChains,
    treeId: _.toNumber(_.nth(pathArray, 3)),
    hatId: ipId ? hatIdDecimalToHex(hatIdIpToDecimal(ipId)) : undefined,
  };
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
