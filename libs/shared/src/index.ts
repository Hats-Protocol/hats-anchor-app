import {
  hatIdDecimalToHex,
  hatIdDecimalToIp,
  hatIdHexToDecimal,
  hatIdIpToDecimal,
} from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
import { Hex } from 'viem';

export * from './hats';

/**
 * @deprecated
 * ========== DEPRECATED ==========
 * - DO NOT USE
 * - to be removed
 * - Suggest `hatIdHexToDecimal` from core sdk
 */
export function prettyIdToId(id: string | undefined): Hex {
  if (!id) return '0x';
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore next-line
  return id?.replaceAll('.', '').padEnd(66, '0') as Hex;
}

/**
 * @deprecated
 * ========== DEPRECATED ==========
 * - DO NOT USE
 * - to be removed
 * - Suggest `hatIdDecimalToHex` from core sdk
 */
export function idToPrettyId(id: Hex | undefined): string {
  if (!id) return '0x';
  const treeId = id?.slice(0, 10) as Hex;
  if (id.length === 10) return treeId;
  const children = id?.slice(10);
  const childArray = children?.match(/.{1,4}/g);
  const dropEmpty = _.dropRightWhile(
    childArray,
    (child: string) => child === '0000',
  );
  return _.join([treeId, ...dropEmpty], '.');
}

/**
 * @deprecated
 * ========== DEPRECATED ==========
 * - DO NOT USE
 * - to be removed
 * - Suggest `hatIdDecimalToIp` from core sdk
 */
export function prettyIdToIp(id: string | undefined) {
  if (!id) return '';
  const domains = id
    ?.slice(2)
    ?.split('.')
    ?.map((hexDomain) => {
      return parseInt(hexDomain, 16);
    });

  return domains.join('.');
}

/**
 * Wrapper to convert between Hat ID Hex and Hat ID IP
 * @param id - Hat ID Hex
 * @returns Hat ID IP
 */
export function idToIp(id: Hex | undefined) {
  if (!id) return '';
  return hatIdDecimalToIp(hatIdHexToDecimal(id));
}

/**
 * @deprecated
 * ========== DEPRECATED ==========
 * - DO NOT USE
 * - to be removed
 * - Suggest `hatIdToTreeId` from core sdk
 */
export const toTreeId = (id: string | undefined) => {
  if (!id) return '0x';
  try {
    return `0x${BigInt(id?.slice(0, 10) ?? 0)
      .toString(16)
      .padStart(8, '0')}`;
  } catch (e) {
    //
    return '0x';
  }
};

/**
 * @deprecated
 * ========== DEPRECATED ==========
 * - DO NOT USE
 * - to be removed
 * - Suggest `hatIdIpToDecimal` from core sdk
 */
export function ipToPrettyId(id: string | undefined) {
  const parts = _.split(id, '.');
  const treeId = toTreeId(_.first(parts));
  const children = parts.slice(1).map((child: string) => {
    if (child.length < 4) {
      return child.padStart(4, '0');
    }
    return child;
  });

  return _.join([treeId, ...children], '.');
}

/**
 * @deprecated
 * @HACK UNTIL FUNCTION AVAILABLE IN SDK
 * - takes in a Hat ID IP and returns a Hat ID Hex
 * - `inverse` of `idToIp`
 */
export function ipToHatId(id: string | undefined): Hex {
  if (!id) return '0x';
  return hatIdDecimalToHex(hatIdIpToDecimal(id));
}

// TODO move to utils
export const getDefaultAdminId = (hatId: string) => {
  const currentIpId = hatIdDecimalToIp(BigInt(hatId));
  const splitIpId = _.split(currentIpId, '.');
  const defaultAdminId = _.join(
    _.concat(_.slice(splitIpId, 0, _.subtract(_.size(splitIpId), 1))),
    '.',
  );
  return ipToHatId(defaultAdminId);
};
