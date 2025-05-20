import { hatIdDecimalToIp, hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { get } from 'lodash';
import { AppHat, SupportedChains } from 'types';
import { Hex } from 'viem';

/**
 * Check if a hat is a Top Hat
 * @param hat - The Hat data
 * @returns `true` if the hat is a top hat, `false` otherwise
 */
export const isTopHat = (hat: AppHat | null | undefined) =>
  hat && get(hat, 'levelAtLocalTree') === 0 && get(hat, 'admin.id') === get(hat, 'id');

/**
 * Check if a hat is mutable
 * @param hat - The Hat data
 * @returns `true` if the hat is mutable, `false` otherwise
 */
export const isMutable = (hat: AppHat | null | undefined) => hat && get(hat, 'mutable');

/**
 * Check if a hat is a top hat or mutable
 * @param hat - The Hat data
 * @returns `true` if the hat is a top hat or mutable, `false` otherwise
 */
export const isTopHatOrMutable = (hat: AppHat | null | undefined) => isTopHat(hat) || isMutable(hat);

/**
 * Check if a hat is mutable and not a top hat
 * @param hat - The Hat data
 * @returns `true` if the hat is mutable and not a top hat, `false` otherwise
 */
export const isMutableNotTopHat = (hat: AppHat | null | undefined) => isMutable(hat) && !isTopHat(hat);

/**
 * Format a hat URL
 * @param hatId - The Hat ID
 * @param chainId - The Chain ID
 */
export const anchorHatUrl = ({ hatId, chainId }: { hatId: Hex; chainId: SupportedChains | undefined }) => {
  if (!hatId || !chainId) return '#';
  const basePath = '/trees';
  const id = BigInt(hatId);
  const treeId = Number(hatIdToTreeId(id));
  const hatIp = hatIdDecimalToIp(id);

  return `${basePath}/${chainId}/${treeId}?hatId=${hatIp}`;
};

/**
 * Filter a list of hats by their ID and chain ID
 * @param hats - The hats to filter
 * @returns The unique hats
 */
export const uniqueHats = (hats: Partial<AppHat>[]): Partial<AppHat>[] => {
  return [
    ...hats
      .reduce((map, { id, chainId }) => {
        return map.set(`${id}-${chainId}`, { id, chainId });
      }, new Map())
      .values(),
  ];
};
