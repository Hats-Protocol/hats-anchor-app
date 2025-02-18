import { MUTABILITY, TRIGGER_OPTIONS } from '@hatsprotocol/constants';
import { hatIdDecimalToHex, treeIdToTopHatId } from '@hatsprotocol/sdk-v1-core';
import {
  differenceWith,
  filter,
  find,
  forEach,
  includes,
  isArray,
  isEmpty,
  isEqual,
  map,
  size,
  slice,
  some,
} from 'lodash';
import { FormData, HatExport } from 'types';
import { Hex } from 'viem';

// Helper functions for importing tree data
const compareHatObjects = (hatA: any, hatB: any): any => {
  if (hatB.mutable === MUTABILITY.IMMUTABLE) {
    return null;
  }

  const diffHat: any = {
    id: hatA.id,
  };

  forEach(hatA, (value: any, key: string) => {
    // skip keys that we're handling separately
    if (includes(['createdAt', 'currentSupply', 'imageUri'], key)) {
      return;
    }

    if (key === 'imageUrl') {
      // if imageUrl isn't set imageUri is usually set to ''
      if (!value) {
        return;
      }
      if (!isEqual(String(value), String(hatB[key])) && value !== '#') {
        diffHat.imageUrl = hatA.imageUrl;
      }
      return;
    }

    if (key === 'wearers') {
      diffHat[key] = value;
      return;
    }

    if (includes(['maxSupply', 'currentSupply', 'timestamp', 'parentId'], key)) {
      if (!isEqual(String(value), String(hatB[key]))) {
        diffHat[key] = Number(value);
      }
      return;
    }

    if (includes(['isEligibilityManual', 'isToggleManual'], key)) {
      if (!isEqual(String(value), String(hatB[key]))) {
        diffHat[key] = value ? TRIGGER_OPTIONS.MANUALLY : TRIGGER_OPTIONS.AUTOMATICALLY;
      }
      return;
    }

    if (isArray(value)) {
      const diffArray = differenceWith(value, hatB[key], isEqual);
      if (!isEmpty(diffArray)) diffHat[key] = value;
      return;
    }

    if (!isEqual(value, hatB[key])) {
      diffHat[key] = value;
    }
  });

  return diffHat;
};

export const prepareDraftHats = (
  importedTree: HatExport[],
  onchainTree: FormData[],
  treeId?: number,
): Partial<FormData>[] => {
  if (!treeId) return [];
  const topHatId = hatIdDecimalToHex(treeIdToTopHatId(treeId));
  const hatsWithPatchedIds = patchHatIds(importedTree, topHatId);
  const hatsDifferences = map(hatsWithPatchedIds, (hat: any) => {
    const matchingHat = find(onchainTree, { id: hat.id });
    if (!matchingHat) return hat;
    return compareHatObjects(hat, matchingHat);
  });
  const hatsWithUpdates = filter(
    hatsDifferences,
    (hat: any) => size(hat) > 1 && some(hat, (value: any) => value !== undefined),
  );
  const hatsExcludingTop = filter(hatsWithUpdates, (hat: any) => hat.id !== topHatId);
  return hatsExcludingTop;
};

function patchHatIds(hats: HatExport[], newMainID?: Hex) {
  if (!newMainID) return hats;
  const mainPortion = slice(newMainID, 0, 10).join('');

  return map(hats, (hat: any) => {
    const specificPortionOfId = slice(hat?.id, 10).join('');
    const specificPortionOfAdminId = slice(hat?.adminId, 10).join('');

    // Update id
    if (hat?.id) hat.id = (mainPortion + specificPortionOfId) as Hex;

    // Update adminId in similar fashion
    if (hat?.adminId) hat.adminId = (mainPortion + specificPortionOfAdminId) as Hex;

    return hat;
  });
}
