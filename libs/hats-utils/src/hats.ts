import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { MUTABILITY, TRIGGER_OPTIONS } from 'app-constants';
import { formatImageUrl, ipfsUrl, isImageUrl } from 'app-utils';
import {
  AppHat,
  Controls,
  FormData,
  FormWearer,
  HatExport,
  HatWearer,
} from 'hats-types';
import _ from 'lodash';
import { idToPrettyId, prettyIdToId, prettyIdToIp } from 'shared-utils';
import { Hex } from 'viem';

// ! missing IDs when inactive are hidden
export const calculateNextChildId = (id: string, hatsData: AppHat[]) => {
  const children = _.filter(
    hatsData,
    (h) => h.admin?.id === id || h.parentId === id,
  );
  const lessTop = _.filter(children, (child) => child.id !== id);
  return `${hatIdDecimalToIp(BigInt(id))}.${_.size(lessTop) + 1}`;
};

export function treeCreateEventIdToTreeId(id: string) {
  if (!id) return undefined;
  const hexString = id.slice(0, 10);
  return parseInt(hexString, 16);
}

export const decimalId = (hatId: string | undefined): string => {
  if (!hatId) return '';

  try {
    return BigInt(hatId).toString();
  } catch (err) {
    return '0x';
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const includesAny = (arr: any[], target: any[]) =>
  _.some(target, (v) => _.includes(arr, v));

/**
 * Traverses all ancestry of hat to check for wearers
 * @param wearerHatIds should be an array of `hatId`s worn by the wearer
 * @param hatId should be a `hatId` that is being checked for admin
 * @param current default `false`, include wearing current hatId
 */
export const isWearingAdminHat = (
  wearerHatIds: string[],
  hatId?: string,
  includeCurrent = false,
) => {
  if (!hatId) return false;
  const treeId = hatId.slice(0, 10);
  // separate children IDs
  const children = hatId.slice(10);
  const hats = children.match(/.{1,4}/g);

  if (!hats) return false;

  // map all parent hatIds for the lineage
  let hatIds = _.uniq(
    _.map(hats, (__, i) => {
      const joinedParentHats = hats.slice(0, i).join('');
      return `${treeId}${i > 0 ? `${joinedParentHats}` : ''}`.padEnd(66, '0');
    }),
  );

  if (!includeCurrent) {
    hatIds = _.reject(hatIds, (id) => id === hatId);
  }
  // TODO handle linked trees

  if (!wearerHatIds) return false;
  // check if any of the wearer hats' IDs are admin of any parent hat IDs
  return !!includesAny(wearerHatIds, hatIds);
};

export const isTopHat = (hatData: AppHat | null | undefined) =>
  _.get(hatData, 'levelAtLocalTree') === 0 &&
  _.get(hatData, 'admin.id') === _.get(hatData, 'id');

export const isMutable = (hatData?: AppHat) => _.get(hatData, 'mutable');

export const isTopHatOrMutable = (hatData: AppHat) =>
  isTopHat(hatData) || isMutable(hatData);

export const isMutableNotTopHat = (hatData: AppHat) =>
  isMutable(hatData) && !isTopHat(hatData);

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

const checkNodeDetails = (node: AppHat, type: string) =>
  node?.detailsObject?.data &&
  _.includes(_.keys(node.detailsObject.data), type);

export const checkPermissionsResponsibilities = (
  treeToDisplay: AppHat[],
  controls: Controls[],
) => {
  const hasPermissions = !_.isEmpty(
    _.filter(treeToDisplay, (node: AppHat) =>
      checkNodeDetails(node, 'permissions'),
    ),
  );
  const hasResponsibilities = !_.isEmpty(
    _.filter(treeToDisplay, (node: AppHat) =>
      checkNodeDetails(node, 'responsibilities'),
    ),
  );

  if (!hasPermissions) {
    _.remove(controls, (control: Controls) => control.value === 'permissions');
  }
  if (!hasResponsibilities) {
    _.remove(
      controls,
      (control: Controls) => control.value === 'responsibilities',
    );
  }

  return controls;
};

const unchangedKeys = ['id', 'parentId'];

export const editHasUpdates = (storedData: Partial<FormData>[] | undefined) =>
  !_.isEmpty(
    _.reject(storedData, (data) =>
      _.isEmpty(_.keys(_.omit(data, unchangedKeys))),
    ),
  );

export function getProposedChangesCount(
  hatId: string,
  data: Partial<FormData>[] | undefined,
): number {
  if (!data) return 0;
  const matchingHat = _.find(data, ['id', hatId]);

  if (matchingHat) {
    // Subtracting omit keys that aren't changed/counted in changes
    return _.size(_.keys(_.omit(matchingHat, unchangedKeys))) || 0;
  }

  return 0;
}

export const getAllParents = (hatId?: Hex, tree?: AppHat[]): AppHat[] => {
  const parents: AppHat[] = [];
  if (!hatId || !tree) return parents;
  let currentHat = _.find(tree, { id: hatId });

  while (currentHat?.parentId) {
    parents.push(currentHat);
    currentHat = _.find(tree, { id: currentHat?.parentId });
  }

  return parents;
};

export const getAllDescendants = (hatId: Hex, tree: AppHat[]): AppHat[] => {
  const children = _.filter(tree, (hat) => hat.parentId === hatId);

  const descendants = _.reduce(
    children,
    (acc, child) => {
      return _.concat(acc, child, getAllDescendants(child.id, tree));
    },
    [] as AppHat[],
  );

  return descendants;
};

export const getBranch = (hatId: Hex, tree: AppHat[]): AppHat[] => {
  const targetHat = _.find(tree, { id: hatId });
  if (!targetHat) return [];

  const descendants = getAllDescendants(hatId, tree);

  return [targetHat, ...descendants];
};

export const checkImageForHat = async (img?: string) => {
  const isValidImage = await isImageUrl(formatImageUrl(img));

  if (isValidImage) {
    return formatImageUrl(img);
  }
  return null;
};

const generateCsvContent = (hatWearers: HatWearer[]) => {
  // not fetching ens for all wearers
  let csvContent = 'address\n';

  hatWearers.forEach((hatWearer) => {
    const name = hatWearer.ensName || '';
    csvContent += `${hatWearer.id},${name}\n`;
  });

  return csvContent;
};

export const exportToCsv = (hatWearers: HatWearer[], hatName?: string) => {
  const csvContent = generateCsvContent(hatWearers);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${hatName || 'hat'}-wearers.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Helper function for exporting tree data
const mergeHatsWithStoredData = (
  hats: any[],
  storedData: Partial<FormData>[] | undefined,
) => {
  return _.map(hats, (hat) => {
    const storedHat = _.find(storedData, { id: hat.id });
    const mergedHat = _.merge({}, hat, storedHat);
    const imageUri = storedHat?.imageUrl ?? (hat?.imageUri || '');
    const imageUrl = ipfsUrl(imageUri?.slice(7));
    return {
      ...mergedHat,
      adminId: mergedHat?.adminId || storedHat?.parentId,
      imageUri,
      imageUrl: hat?.imageUrl === '/icon.jpeg' ? '' : imageUrl,
      wearers: _.map(mergedHat.wearers, 'address') || [],
    };
  });
};

const prepareExportTree = (data: any[]): HatExport[] => {
  return _.map(data, (hat) => ({
    id: hat.id,
    status: hat.status,
    createdAt: parseInt(hat.createdAt, 10),
    details: hat.details,
    maxSupply: parseInt(hat.maxSupply, 10),
    eligibility: hat.eligibility,
    toggle: hat.toggle,
    mutable: hat.mutable === MUTABILITY.MUTABLE,
    currentSupply: parseInt(hat.currentSupply, 10),
    wearers: hat.wearers,
    adminId: hat.adminId || hat.parentId,
    imageUri: hat.imageUri || '',
    // imageUrl: hat.imageUrl || '', // don't export imageUrl rn
    detailsObject: {
      type: '1.0',
      data: {
        name: hat.name,
        description: hat.description,
        responsibilities: hat.responsibilities,
        authorities: hat.authorities,
        guilds: hat.guilds,
        spaces: hat.spaces,
        eligibility: {
          manual: hat.isEligibilityManual === TRIGGER_OPTIONS.MANUALLY,
          criteria: hat.revocationsCriteria,
        },
        toggle: {
          manual: hat.isToggleManual === TRIGGER_OPTIONS.MANUALLY,
          criteria: hat.deactivationsCriteria,
        },
      },
    },
  }));
};

const patchDataToEnsureConsecutiveIds = (tree: HatExport[]) => {
  const dataWithPrettyIds = _.map(tree, (hat) => ({
    ...hat,
    id: idToPrettyId(hat.id),
    adminId: idToPrettyId(hat.adminId),
  }));

  const maxDepth =
    _.max(
      _.map(dataWithPrettyIds, (item) => (item.id.match(/\./g) || []).length),
    ) || 1;

  _.forEach(_.range(1, maxDepth + 1), (depth) => {
    let expectedNumber = 1;
    let lastSegment = '';

    _.forEach(dataWithPrettyIds, (item, index) => {
      const idSegments = item.id.split('.');
      if (idSegments.length - 1 < depth) return;

      const currentSegment = idSegments[depth];
      if (currentSegment !== lastSegment) {
        lastSegment = currentSegment;
        expectedNumber += 1;
      }

      const currentNumber = parseInt(currentSegment, 16);
      if (currentNumber !== expectedNumber - 1) {
        const newSegment = (expectedNumber - 1).toString(16).padStart(4, '0');
        idSegments[depth] = newSegment;
        dataWithPrettyIds[index].id = idSegments.join('.');

        if (idSegments.length > 1) {
          const parentSegments = _.slice(idSegments, 0, -1);
          dataWithPrettyIds[index].adminId = parentSegments.join('.');
        }

        _.forEach(dataWithPrettyIds, (child) => {
          if (child.adminId === item.id) {
            // eslint-disable-next-line no-param-reassign
            child.adminId = dataWithPrettyIds[index].id;
          }
        });
      }
    });
  });

  return _.map(dataWithPrettyIds, (hat) => ({
    ...hat,
    id: prettyIdToId(hat.id),
    adminId: prettyIdToId(hat.adminId),
  }));
};

export const handleExportBranch = ({
  targetHatId,
  treeToDisplay,
  linkedHatIds,
  storedData,
  chainId,
  toast,
  shouldPatchIds = false,
}: {
  targetHatId?: Hex;
  treeToDisplay?: AppHat[];
  linkedHatIds?: Hex[];
  storedData?: Partial<FormData>[];
  decimalTreeId?: number;
  chainId?: number;
  toast: any;
  shouldPatchIds?: boolean;
}) => {
  if (
    !targetHatId ||
    !treeToDisplay ||
    !linkedHatIds ||
    !storedData ||
    !chainId
  )
    return;
  const branch = getBranch(targetHatId, treeToDisplay);
  const hatsWithoutLinkedHats = _.filter(
    branch,
    (hat) => hat.id && !linkedHatIds?.includes(hat.id),
  );
  const targetHatInBranch = _.find(hatsWithoutLinkedHats, {
    id: targetHatId,
  });
  if (
    linkedHatIds?.includes(targetHatId) &&
    targetHatInBranch &&
    targetHatInBranch.admin
  ) {
    targetHatInBranch.admin.id = targetHatId;
  }
  const hatId = hatIdDecimalToIp(BigInt(targetHatId));
  const targetHat = _.find(treeToDisplay, { id: targetHatId });
  const type = isTopHat(targetHat) ? 'tree' : 'branch';

  const onchainHats = flattenHatData(hatsWithoutLinkedHats);
  const mergedHats = mergeHatsWithStoredData(onchainHats, storedData);
  const preparedTree = prepareExportTree(mergedHats);
  const patchedData = patchDataToEnsureConsecutiveIds(preparedTree);

  const fileData = JSON.stringify(shouldPatchIds ? patchedData : preparedTree);
  const blob = new Blob([fileData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `chain-${chainId}-${type}-${hatId}.json`;
  link.href = url;
  link.click();
  toast.success({
    title: `Exported ${type} #${hatId} to your desktop`,
  });
};

// Helper functions for importing tree data
const compareHatObjects = (hatA: any, hatB: any): any => {
  if (hatB.mutable === MUTABILITY.IMMUTABLE) {
    return null;
  }

  const diffHat: any = {
    id: hatA.id,
  };

  _.forEach(hatA, (value, key) => {
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
      if (_.isObject(_.first(value))) {
        // handle wearers separately to merge the lists
        if (key === 'wearers') {
          const wearersDiff = _.differenceBy(value, hatB[key], 'address');
          if (!_.isEmpty(wearersDiff)) {
            diffHat[key] = value; // set to combined wearers lists
          }
          return;
        }
      }
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
  treeId?: Hex,
): Partial<FormData>[] => {
  const hatsWithPatchedIds = patchHatIds(importedTree, prettyIdToId(treeId));
  const hatsDifferences = _.map(hatsWithPatchedIds, (hat) => {
    const matchingHat = _.find(onchainTree, { id: hat.id });
    if (!matchingHat) return hat;
    return compareHatObjects(hat, matchingHat);
  });
  const hatsWithUpdates = _.filter(
    hatsDifferences,
    (hat) => _.size(hat) > 1 && _.some(hat, (value) => value !== undefined),
  );
  const hatsExcludingTop = _.filter(
    hatsWithUpdates,
    (hat: FormData) => hat.id !== prettyIdToId(treeId),
  );
  return hatsExcludingTop;
};

function patchHatIds(hats: HatExport[], newMainID?: Hex) {
  if (!newMainID) return hats;
  const mainPortion = _.slice(newMainID, 0, 10).join('');

  return _.map(hats, (hat) => {
    const specificPortionOfId = _.slice(hat?.id, 10).join('');
    const specificPortionOfAdminId = _.slice(hat?.adminId, 10).join('');

    // Update id
    // eslint-disable-next-line no-param-reassign
    if (hat?.id) hat.id = (mainPortion + specificPortionOfId) as Hex;

    // Update adminId in similar fashion
    if (hat?.adminId)
      // eslint-disable-next-line no-param-reassign
      hat.adminId = (mainPortion + specificPortionOfAdminId) as Hex;

    return hat;
  });
}

// interface ExtendedExport extends HatExport {
//   imageUrl: string;
//   parentId: Hex;
// }

// general helper functions for importing and exporting tree data
export const flattenHatData = (data: any[]): FormData[] =>
  _.map(
    data || [],
    (hat) =>
      ({
        id: hat.id,
        status: hat.status,
        createdAt: _.toNumber(hat.createdAt),
        // details: hat.details,
        maxSupply: _.toString(hat.maxSupply),
        eligibility: hat.eligibility,
        isEligibilityManual:
          hat.detailsObject?.data?.eligibility?.manual !== false
            ? TRIGGER_OPTIONS.MANUALLY
            : TRIGGER_OPTIONS.AUTOMATICALLY,
        revocationsCriteria:
          hat.detailsObject?.data?.eligibility?.criteria || [],
        toggle: hat.toggle,
        isToggleManual:
          hat.detailsObject?.data?.toggle?.manual !== false
            ? TRIGGER_OPTIONS.MANUALLY
            : TRIGGER_OPTIONS.AUTOMATICALLY,
        deactivationsCriteria: _.get(
          hat,
          'detailsObject.data.toggle.criteria',
          [],
        ),
        mutable: hat.mutable ? MUTABILITY.MUTABLE : MUTABILITY.IMMUTABLE,
        // imageUri: hat.imageUri,
        currentSupply: _.toNumber(hat.currentSupply),
        wearers: extractWearers(hat.wearers),
        adminId: hat.adminId || hat.parentId || _.get(hat, 'admin.id'),
        imageUrl: hat.imageUrl,
        imageUri: hat.imageUri,
        name: _.get(hat, 'detailsObject.data.name', 'New Hat'),
        description: _.get(
          hat,
          'detailsObject.data.description',
          'No description',
        ),
        responsibilities: _.get(hat, 'detailsObject.data.responsibilities', []),
        authorities: _.get(hat, 'detailsObject.data.authorities', []),
        guilds: _.get(hat, 'detailsObject.data.guilds', []),
        spaces: _.get(hat, 'detailsObject.data.spaces', []),
      } as FormData),
  );

const extractWearers = (wearers: any[]): FormWearer[] => {
  if (
    _.isArray(wearers) &&
    !_.isEmpty(wearers) &&
    _.isString(_.first(wearers))
  ) {
    return _.map(wearers, (wearer) => ({
      address: wearer as Hex,
      ens: '',
    }));
  }
  return _.map(wearers, (wearer) => ({
    address: wearer.id,
    ens: '',
  }));
};

export const checkMissingParents = (
  hats: Partial<FormData>[],
  onchainHats: AppHat[] | undefined,
) => {
  if (!onchainHats) return true;
  const onchainIds = _.map(onchainHats, 'id');
  const draftIds = _.map(hats, 'id');
  const idList = _.uniq(_.concat(onchainIds, draftIds));

  const missingParent = _.filter(hats, (hat) => {
    const localHat = _.find(onchainHats, { id: hat.id });
    if (!hat.adminId && !localHat?.admin?.id) return true;
    return !_.includes(idList, hat.adminId || localHat?.admin?.id);
  });

  return _.some(missingParent);
};

export const checkMissingSiblings = (
  hats: Partial<FormData>[],
  onchainHats: AppHat[] | undefined,
) => {
  if (!onchainHats || !hats || hats.length === 0)
    return { hasMissing: false, missingSiblings: [] };

  const onchainPrettyIds = _.map(_.filter(onchainHats, 'id'), (hat) =>
    idToPrettyId(hat.id),
  );
  const hatsWithId = _.filter(hats, 'id');
  const allIdsSet = new Set([
    ...onchainPrettyIds,
    ..._.map(hatsWithId, (hat) => idToPrettyId(hat.id)),
  ]);

  const missingSiblings: string[] = [];

  _.forEach(hatsWithId, (hat) => {
    const prettyId = idToPrettyId(hat.id);
    const idSegments = prettyId.split('.');

    if (idSegments.length < 2 || !idSegments[0]) return;

    const siblingPrefix = idSegments.slice(0, -1).join('.');
    const siblingNumber = parseInt(idSegments[idSegments.length - 1], 16);

    if (siblingNumber > 1) {
      const previousSibling = `${siblingPrefix}.${(siblingNumber - 1)
        .toString(16)
        .padStart(4, '0')}`;
      if (!allIdsSet.has(previousSibling)) {
        missingSiblings.push(prettyIdToIp(previousSibling));
      }
    }
  });

  return {
    hasMissing: missingSiblings.length > 0,
    missingSiblings,
  };
};
