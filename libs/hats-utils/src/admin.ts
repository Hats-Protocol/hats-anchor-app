import { includes, map, reject, some, uniq } from 'lodash';
import { Hex } from 'viem';

// TODO move
const includesAny = (arr: unknown[], target: unknown[]) => some(target, (v: unknown) => includes(arr, v));

/**
 * Traverses all ancestry of hat to check for wearers
 * @param wearerHatIds should be an array of `hatId`s worn by the wearer
 * @param hatId should be a `hatId` that is being checked for admin
 * @param current default `false`, include wearing current hatId
 */
export const isWearingAdminHat = (wearerHatIds: string[], hatId?: string, includeCurrent = false) => {
  if (!hatId) return false;
  const treeId = hatId.slice(0, 10);
  // separate children IDs
  const children = hatId.slice(10);
  const hats = children.match(/.{1,4}/g);

  if (!hats) return false;

  // map all parent hatIds for the lineage
  let hatIds = uniq(
    map(hats, (__: unknown, i: number) => {
      const joinedParentHats = hats.slice(0, i).join('');
      return `${treeId}${i > 0 ? `${joinedParentHats}` : ''}`.padEnd(66, '0');
    }),
  ) as Hex[];

  if (!includeCurrent) {
    hatIds = reject(hatIds, (id: Hex) => id === hatId);
  }
  // TODO [md] handle linked trees

  if (!wearerHatIds) return false;
  // check if any of the wearer hats' IDs are admin of any parent hat IDs
  return !!includesAny(wearerHatIds, hatIds);
};
