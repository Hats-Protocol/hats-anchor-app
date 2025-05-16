import { hatIdDecimalToIp, hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { get } from 'lodash';
import { AppHat, SupportedChains } from 'types';
import { Hex } from 'viem';

/**
 * Check if a hat is a Top Hat
 * @param hatData - The Hat data
 * @returns `true` if the hat is a top hat, `false` otherwise
 */
export const isTopHat = (hatData: AppHat | null | undefined) =>
  get(hatData, 'levelAtLocalTree') === 0 && get(hatData, 'admin.id') === get(hatData, 'id');

export const isMutable = (hatData?: AppHat) => get(hatData, 'mutable');

export const isTopHatOrMutable = (hatData: AppHat) => isTopHat(hatData) || isMutable(hatData);

export const isMutableNotTopHat = (hatData: AppHat) => isMutable(hatData) && !isTopHat(hatData);

export const formHatUrl = ({ hatId, chainId }: { hatId: Hex; chainId: SupportedChains | undefined }) => {
  const basePath = '/trees';
  const id = BigInt(hatId);
  const treeId = Number(hatIdToTreeId(id));
  const hatIp = hatIdDecimalToIp(id);

  return `${basePath}/${chainId}/${treeId}?hatId=${hatIp}`;
};

export const uniqueHats = (hats: Partial<AppHat>[]): Partial<AppHat>[] => {
  return [
    ...hats
      .reduce((map, { id, chainId }) => {
        return map.set(`${id}-${chainId}`, { id, chainId });
      }, new Map())
      .values(),
  ];
};
