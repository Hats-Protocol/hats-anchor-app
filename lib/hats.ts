import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
import { Hex } from 'viem';

import { defaultHat, MUTABILITY, TRIGGER_OPTIONS } from '@/constants';
import {
  Controls,
  FormData,
  FormWearer,
  Hat,
  HatExport,
  HatWearer,
  Hierarchy,
  InputObject,
} from '@/types';

import { formatImageUrl, isImageUrl } from './general';
import { ipfsUrl } from './ipfs';

// hats-utils or app-utils mostly

// ! missing IDs when inactive are hidden
export const calculateNextChildId = (id: string, hatsData: Hat[]) => {
  const children = _.filter(
    hatsData,
    (h) => h.admin?.id === id || h.parentId === id,
  );
  const lessTop = _.filter(children, (child) => child.id !== id);
  return `${hatIdDecimalToIp(BigInt(id))}.${_.size(lessTop) + 1}`;
};

export function createHierarchy(
  data: InputObject[],
  currentHatId?: Hex,
): Hierarchy {
  if (!currentHatId) return {} as Hierarchy;

  const currentHat = _.find(data, { id: currentHatId });
  if (!currentHat) return {} as Hierarchy;

  const currentHierarchy: Hierarchy = {
    id: currentHat.id,
    parentId: (currentHat.id === currentHat.parentId
      ? null
      : currentHat.parentId) as Hex,
  };

  const siblings =
    currentHat.parentId !== currentHat.id
      ? _.filter(
          data,
          (hat) =>
            hat.parentId === currentHat.parentId && hat.id !== hat.parentId,
        )
      : [];

  const sortedSiblings = _.sortBy(siblings, (sibling) => BigInt(sibling.id));
  const currentHatIndex = _.findIndex(sortedSiblings, { id: currentHat.id });
  const leftSiblings = _.slice(sortedSiblings, 0, currentHatIndex);
  const rightSiblings = _.slice(sortedSiblings, currentHatIndex + 1);
  currentHierarchy.leftSiblings = _.map(leftSiblings, 'id');
  currentHierarchy.rightSiblings = _.map(rightSiblings, 'id');
  currentHierarchy.leftSibling = _.get(_.last(leftSiblings), 'id') as Hex;
  currentHierarchy.rightSibling = _.get(_.first(rightSiblings), 'id') as Hex;

  const children = _.sortBy(
    _.filter(
      data,
      (item) => item.parentId === currentHatId && item.id !== currentHatId,
    ),
    'id',
  );

  currentHierarchy.firstChild = _.first(children)?.id as Hex;

  return currentHierarchy;
}

export function prettyIdToId(id: string | undefined): Hex {
  if (!id) return '0x';
  return id?.replaceAll('.', '').padEnd(66, '0') as Hex;
}

export function idToPrettyId(id: Hex | undefined): string {
  if (!id) return '0x';
  const treeId = id?.slice(0, 10) as Hex;
  if (id.length === 10) return treeId;
  const children = id?.slice(10);
  const childArray = children?.match(/.{1,4}/g);
  const dropEmpty = _.dropRightWhile(childArray, (child) => child === '0000');
  return _.join([treeId, ...dropEmpty], '.');
}

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

export function treeCreateEventIdToTreeId(id: string) {
  if (!id) return undefined;
  const hexString = id.slice(0, 10);
  return parseInt(hexString, 16);
}

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

export function ipToPrettyId(id: string | undefined) {
  const parts = _.split(id, '.');
  const treeId = toTreeId(_.first(parts));
  const children = parts.slice(1).map((child) => {
    if (child.length < 4) {
      return child.padStart(4, '0');
    }
    return child;
  });

  return _.join([treeId, ...children], '.');
}

// HACK UNTIL FUNCTION AVAILABLE IN SDK
export function ipToHatId(id: string | undefined): Hex {
  if (!id) return '0x';
  return prettyIdToId(ipToPrettyId(id));
}

// expects fullId
export const hatIdToHex = (hatId: string | null) => {
  if (!hatId || hatId === '0x') return '';
  return `0x${BigInt(hatId).toString(16).padStart(64, '0')}`;
};

// treeId is a decimal string '5'
// export const decimalToTreeId = (treeId: string) => {
//   if (!treeId) return null;
//   return `0x${BigInt(treeId).toString(16).padStart(8, '0')}`;
// };

export const decimalIdToId = (decimalId: number | string | undefined): Hex => {
  if (!decimalId) return '0x';

  try {
    return `0x${BigInt(decimalId).toString(16).padStart(64, '0')}`;
  } catch (err) {
    return '0x';
  }
};

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

export const isTopHat = (hatData: Hat | null | undefined) =>
  _.get(hatData, 'levelAtLocalTree') === 0 &&
  _.get(hatData, 'admin.id') === _.get(hatData, 'id');

export const isMutable = (hatData?: Hat) => _.get(hatData, 'mutable');

export const isTopHatOrMutable = (hatData: Hat) =>
  isTopHat(hatData) || isMutable(hatData);

export const isMutableNotTopHat = (hatData: Hat) =>
  isMutable(hatData) && !isTopHat(hatData);

// same as toTreeId??? similar but used to get full ID (for top hat ID)
export const getTreeId = (prettyHatId: Hex | null, full = false) => {
  if (!prettyHatId) return '';
  if (!full) return prettyHatId.slice(0, 10);
  return prettyHatId.slice(0, 10).padEnd(66, '0');
};

const checkNodeDetails = (node: Hat, type: string) =>
  node?.detailsObject?.data &&
  _.includes(_.keys(node.detailsObject.data), type);

export const checkPermissionsResponsibilities = (
  treeToDisplay: Hat[],
  controls: Controls[],
) => {
  const hasPermissions = !_.isEmpty(
    _.filter(treeToDisplay, (node: Hat) =>
      checkNodeDetails(node, 'permissions'),
    ),
  );
  const hasResponsibilities = !_.isEmpty(
    _.filter(treeToDisplay, (node: Hat) =>
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

export const getDefaultAdminId = (hatId: string) => {
  const currentIpId = hatIdDecimalToIp(BigInt(hatId));
  const splitIpId = _.split(currentIpId, '.');
  const defaultAdminId = _.join(
    _.concat(_.slice(splitIpId, 0, _.subtract(_.size(splitIpId), 1))),
    '.',
  );
  return ipToHatId(defaultAdminId);
};

const calculateParentId = (hatId: Hex) => {
  if (!hatId) return undefined;
  const ipId = hatIdDecimalToIp(BigInt(hatId));
  const splitIpId = _.split(ipId, '.');
  const parentId = _.join(
    _.slice(splitIpId, 0, _.subtract(_.size(splitIpId), 1)),
    '.',
  );
  const parentHex = prettyIdToId(ipToPrettyId(parentId));

  return parentHex;
};

export const translateDrafts = ({
  chainId,
  treeId,
  drafts,
}: {
  chainId: number;
  treeId: Hex;
  drafts: Partial<FormData>[];
}): Hat[] => {
  const extendDrafts = _.map(drafts, (hat) => {
    if (!hat.id) return undefined;
    return {
      ...hat,
      ...defaultHat,
      chainId,
      name: hatIdDecimalToIp(BigInt(hat.id)),
      detailsObject: {
        type: '1.0',
        data: {
          name: hat.name || 'New Hat',
        },
      },
      imageUri: '',
      parentId: calculateParentId(hat.id),
      mutable: _.has(hat, 'mutable')
        ? hat.mutable === MUTABILITY.MUTABLE
        : true,
      levelAtLocalTree: _.subtract(
        _.size(_.split(hatIdDecimalToIp(BigInt(hat.id)), '.')),
        2, // top hat = 0, so subtract 2 to get level
      ),
      tree: {
        id: treeId,
      },
    };
  });

  const defined = _.reject(extendDrafts, _.isUndefined) as Hat[];

  return _.sortBy(defined, (hat) => BigInt(hat.id));
};

export const getAllParents = (hatId?: Hex, tree?: Hat[]): Hex[] => {
  const parents: Hex[] = [];
  if (!hatId || !tree) return parents;
  let currentHat = tree.find((hat) => hat.id === hatId);

  while (currentHat?.parentId) {
    const { parentId } = currentHat;
    parents.push(parentId);
    currentHat = tree.find((hat) => hat.id === parentId);
  }

  return parents;
};

export const getAllDescendants = (hatId: Hex, tree: Hat[]): Hat[] => {
  const children = _.filter(tree, (hat) => hat.parentId === hatId);

  const descendants = _.reduce(
    children,
    (acc, child) => {
      return _.concat(acc, child, getAllDescendants(child.id, tree));
    },
    [] as Hat[],
  );

  return descendants;
};

export const getBranch = (hatId: Hex, tree: Hat[]): Hat[] => {
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

export const handleExportBranch = ({
  targetHatId,
  treeToDisplay,
  linkedHatIds,
  storedData,
  chainId,
  toast,
}: {
  targetHatId?: Hex;
  treeToDisplay?: Hat[];
  linkedHatIds?: Hex[];
  storedData?: Partial<FormData>[];
  decimalTreeId?: number;
  chainId?: number;
  toast: any;
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
  const targetHat = _.find(treeToDisplay, { id: targetHatId });
  const type = isTopHat(targetHat) ? 'tree' : 'branch';

  const onchainHats = flattenHatData(hatsWithoutLinkedHats);
  const mergedHats = mergeHatsWithStoredData(onchainHats, storedData);
  const preparedTree = prepareExportTree(mergedHats);
  const fileData = JSON.stringify(preparedTree);
  const hatId = hatIdDecimalToIp(BigInt(targetHatId));

  const blob = new Blob([fileData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `chain-${chainId}-${type}-${hatId}.json`; // Change filename to denote branch
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

    if (key === 'parentId') {
      if (!_.isEqual(String(value), String(hatB[key]))) {
        diffHat[key] = hatB[key];
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

    if (_.includes(['maxSupply', 'currentSupply', 'timestamp'], key)) {
      if (!_.isEqual(String(value), String(hatB[key]))) {
        diffHat[key] = Number(value);
      }
      return;
    }

    if (_.isArray(value)) {
      if (_.isObject(_.first(value))) {
        let resultArray = _.unionWith(value, hatB[key], _.isEqual);
        if (key === 'wearers') {
          resultArray = _.differenceBy(value, hatB[key], 'address');
          if (_.isEmpty(resultArray)) {
            return;
          }
        }
        if (!_.isEqual(resultArray.sort(), hatB[key].sort())) {
          diffHat[key] = resultArray;
        }
      } else {
        const diffArray = _.differenceWith(value, hatB[key], _.isEqual);
        if (!_.isEmpty(diffArray)) diffHat[key] = diffArray;
      }
    } else if (!_.isEqual(value, hatB[key])) {
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

// general helper functions for importing and exporting tree data
export const flattenHatData = (data: any[]): FormData[] =>
  _.map(data || [], (hat) => ({
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
    revocationsCriteria: hat.detailsObject?.data?.eligibility?.criteria || [],
    toggle: hat.toggle,
    isToggleManual:
      hat.detailsObject?.data?.toggle?.manual !== false
        ? TRIGGER_OPTIONS.MANUALLY
        : TRIGGER_OPTIONS.AUTOMATICALLY,
    deactivationsCriteria: _.get(hat, 'detailsObject.data.toggle.criteria', []),
    mutable: hat.mutable ? MUTABILITY.MUTABLE : MUTABILITY.IMMUTABLE,
    // imageUri: hat.imageUri,
    currentSupply: _.toNumber(hat.currentSupply),
    wearers: extractWearers(hat.wearers),
    adminId: hat.adminId || hat.parentId || _.get(hat, 'admin.id'),
    imageUrl: hat.imageUrl,
    imageUri: hat.imageUri,
    name: _.get(hat, 'detailsObject.data.name'),
    description: _.get(hat, 'detailsObject.data.description'),
    responsibilities: _.get(hat, 'detailsObject.data.responsibilities', []),
    authorities: _.get(hat, 'detailsObject.data.authorities', []),
    guilds: _.get(hat, 'detailsObject.data.guilds', []),
    spaces: _.get(hat, 'detailsObject.data.spaces', []),
  }));

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

export const checkMissingHats = (
  hats: Partial<FormData>[],
  onchainHats: Hat[] | undefined,
) => {
  if (!onchainHats) return true;
  const onchainIds = _.map(onchainHats, 'id');
  const draftIds = _.map(hats, 'id');
  const idList = _.uniq(_.concat(onchainIds, draftIds));

  const missingParent = _.filter(hats, (hat) => {
    if (!hat.adminId) return true;
    return !_.includes(idList, hat.adminId);
  });

  return _.some(missingParent);
};
