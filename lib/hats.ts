/* eslint-disable no-plusplus */
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
import { Hex } from 'viem';

import { defaultHat, MUTABILITY } from '@/constants';
import { FormData, Hierarchy, IControls, IHat, InputObject } from '@/types';

import { formatImageUrl, isImageUrl } from './general';

export const calculateNextChildId = (id: string, hatsData: IHat[]) => {
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
  currentHierarchy.leftSibling = _.last(leftSiblings)?.id as Hex;
  currentHierarchy.rightSibling = _.first(rightSiblings)?.id as Hex;

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
export const decimalToTreeId = (treeId: string) => {
  if (!treeId) return null;
  return `0x${BigInt(treeId).toString(16).padStart(8, '0')}`;
};

export const decimalIdToId = (decimalId: number | undefined) => {
  if (!decimalId) return '0x';
  try {
    const bn = decimalId;
    return `0x${bn.toString(16).slice(2).padStart(64, '0')}`;
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
  target.some((v) => arr.includes(v));

/**
 * @param hatId should be a `hatId`
 * @param wearerHatIds should be an array of `hatId`s worn by the wearer
 * @param current default `false`, include wearing current hatId
 */
export const isWearer = (
  wearerHatIds: string[],
  hatId?: string,
  current = false,
) => {
  if (!hatId) return false;
  const treeId = hatId.slice(0, 10);
  // separate children IDs
  const children = hatId.slice(10);
  const hats = children.match(/.{1,4}/g); // _.split(children, '.');

  if (!hats) return false;

  if (!current) hats.pop();

  // map all parent hatIds for the lineage
  const hatIds = hats.map((__, i) => {
    const joinedParentHats = hats.slice(0, i).join('');
    return `${treeId}${i > 0 ? `${joinedParentHats}` : ''}`.padEnd(66, '0');
  });

  if (!wearerHatIds) return false;
  // check if any of the wearer hats' IDs are admin of any parent hat IDs
  return !!includesAny(wearerHatIds, hatIds);
};

export const isTopHat = (hatData: IHat | null | undefined) =>
  _.get(hatData, 'levelAtLocalTree') === 0 &&
  _.get(hatData, 'admin.id') === _.get(hatData, 'id');

export const isMutable = (hatData?: IHat) => _.get(hatData, 'mutable');

export const isTopHatOrMutable = (hatData: IHat) =>
  isTopHat(hatData) || isMutable(hatData);

export const isMutableNotTopHat = (hatData: IHat) =>
  isMutable(hatData) && !isTopHat(hatData);

// same as toTreeId??? similar but used to get full ID (for top hat ID)
export const getTreeId = (prettyHatId: string | null, full = false) => {
  if (!prettyHatId) return '';
  if (!full) return prettyHatId.slice(0, 10);
  return prettyHatId.slice(0, 10).padEnd(66, '0');
};

const checkNodeDetails = (node: IHat, type: string) =>
  node?.detailsObject?.data &&
  _.includes(_.keys(node.detailsObject.data), type);

export const checkPermissionsResponsibilities = (
  treeToDisplay: IHat[],
  controls: IControls[],
) => {
  const hasPermissions = !_.isEmpty(
    _.filter(treeToDisplay, (node: IHat) =>
      checkNodeDetails(node, 'permissions'),
    ),
  );
  const hasResponsibilities = !_.isEmpty(
    _.filter(treeToDisplay, (node: IHat) =>
      checkNodeDetails(node, 'responsibilities'),
    ),
  );

  if (!hasPermissions) {
    _.remove(controls, (control: IControls) => control.value === 'permissions');
  }
  if (!hasResponsibilities) {
    _.remove(
      controls,
      (control: IControls) => control.value === 'responsibilities',
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
}): IHat[] => {
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

  return _.filter(extendDrafts, (x) => x) as IHat[];
};

export const isAncestor = (
  hatId?: string,
  potentialAncestorId?: string,
  tree?: IHat[],
) => {
  let currentParentId = hatId;
  while (currentParentId) {
    if (currentParentId === potentialAncestorId) return true;
    const hat = _.find(tree, { id: currentParentId });
    currentParentId = (hat as IHat)?.parentId;
  }
  return false;
};

export const getAllParents = (hatId?: Hex, tree?: IHat[]): Hex[] => {
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

export const checkImageForHat = async (img?: string) => {
  const isValidImage = await isImageUrl(formatImageUrl(img));

  if (isValidImage) {
    return formatImageUrl(img);
  }
  return null;
};
