import { hatIdDecimalToIp, hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
import { AppHat, SupportedChains } from 'types';
import { Hex } from 'viem';

export const isTopHat = (hatData: AppHat | null | undefined) =>
  _.get(hatData, 'levelAtLocalTree') === 0 && _.get(hatData, 'admin.id') === _.get(hatData, 'id');

export const isMutable = (hatData?: AppHat) => _.get(hatData, 'mutable');

export const isTopHatOrMutable = (hatData: AppHat) => isTopHat(hatData) || isMutable(hatData);

export const isMutableNotTopHat = (hatData: AppHat) => isMutable(hatData) && !isTopHat(hatData);

/**
 * ========== DEPRECATED ==========
 * - DO NOT USE
 * - to be removed
 * - Suggest `hatIdToTreeId` from core sdk
 */
export const getTreeId = (prettyHatId: Hex | null, full = false) => {
  if (!prettyHatId) return '';
  if (!full) return prettyHatId.slice(0, 10);
  return prettyHatId.slice(0, 10).padEnd(66, '0');
};

export const formHatUrl = ({ hatId, chainId }: { hatId: Hex; chainId: SupportedChains | undefined }) => {
  const basePath = '/trees';
  const id = BigInt(hatId);
  const treeId = Number(hatIdToTreeId(id));
  const hatIp = hatIdDecimalToIp(id);

  return `${basePath}/${chainId}/${treeId}?hatId=${hatIp}`;
};
