import { MUTABILITY, TRIGGER_OPTIONS } from '@hatsprotocol/constants';
import { hatIdDecimalToHex, treeIdToTopHatId } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
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

  _.forEach(hatA, (value: any, key: string) => {
    // skip keys that we're handling separately
    if (_.includes(['createdAt', 'currentSupply', 'imageUri'], key)) {
      return;
    }

    if (key === 'imageUrl') {
      // if imageUrl isn't set imageUri is usually set to ''
      if (!value) {
        return;
      }
      if (!_.isEqual(String(value), String(hatB[key]))) {
        diffHat.imageUrl = hatA.imageUrl;
      }
      return;
    }

    if (key === 'wearers') {
      diffHat[key] = value;
      return;
    }

    if (
      _.includes(['maxSupply', 'currentSupply', 'timestamp', 'parentId'], key)
    ) {
      if (!_.isEqual(String(value), String(hatB[key]))) {
        diffHat[key] = Number(value);
      }
      return;
    }

    if (_.includes(['isEligibilityManual', 'isToggleManual'], key)) {
      if (!_.isEqual(String(value), String(hatB[key]))) {
        diffHat[key] = value
          ? TRIGGER_OPTIONS.MANUALLY
          : TRIGGER_OPTIONS.AUTOMATICALLY;
      }
      return;
    }

    if (_.isArray(value)) {
      const diffArray = _.differenceWith(value, hatB[key], _.isEqual);
      if (!_.isEmpty(diffArray)) diffHat[key] = value;
      return;
    }

    if (!_.isEqual(value, hatB[key])) {
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
  const hatsDifferences = _.map(hatsWithPatchedIds, (hat: any) => {
    const matchingHat = _.find(onchainTree, { id: hat.id });
    if (!matchingHat) return hat;
    return compareHatObjects(hat, matchingHat);
  });
  const hatsWithUpdates = _.filter(
    hatsDifferences,
    (hat: any) =>
      _.size(hat) > 1 && _.some(hat, (value: any) => value !== undefined),
  );
  const hatsExcludingTop = _.filter(
    hatsWithUpdates,
    (hat: any) => hat.id !== topHatId,
  );
  return hatsExcludingTop;
};

function patchHatIds(hats: HatExport[], newMainID?: Hex) {
  if (!newMainID) return hats;
  const mainPortion = _.slice(newMainID, 0, 10).join('');

  return _.map(hats, (hat: any) => {
    const specificPortionOfId = _.slice(hat?.id, 10).join('');
    const specificPortionOfAdminId = _.slice(hat?.adminId, 10).join('');

    // Update id
    if (hat?.id) hat.id = (mainPortion + specificPortionOfId) as Hex;

    // Update adminId in similar fashion
    if (hat?.adminId)
      hat.adminId = (mainPortion + specificPortionOfAdminId) as Hex;

    return hat;
  });
}
