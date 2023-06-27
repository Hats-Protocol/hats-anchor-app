/* eslint-disable no-plusplus */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-use-before-define */
import { IHatData, ITree } from '@/types';
import { fetchHatsDetails, fetchManyWearerDetails } from '@/gql/helpers';
import { fetchMultipleHatsDetails } from '@/hooks/useHatDetailsField';
import { extendWearers, extendControllers } from '@/lib/contract';

import _ from 'lodash';
import { ZERO_ADDRESS } from '@/constants';

export type HierarchyObject = {
  id: string;
  parentId: string | null;
  firstChild: string | null;
  leftSibling: string | null;
  rightSibling: string | null;
};

type InputObject = {
  id: string;
  parentId: string;
};

export async function toTreeStructure(
  treeData: ITree,
  hatIdToImage: any,
  chainId: number,
): Promise<{
  tree: IHatData[];
  hats: any;
  hierarchy: HierarchyObject[];
}> {
  const hatsArray: IHatData[] = [];
  const hatIds: string[] = [];

  treeData?.hats?.forEach((hat: any) => {
    hatIds.push(hat.id);
  });

  if (treeData?.linkedToHat) {
    hatIds.push(treeData.linkedToHat.id);
  }

  if (treeData?.parentOfTrees) {
    treeData.parentOfTrees.forEach((childTree: any) => {
      if (!childTree?.id) return;
      const id = prettyIdToId(childTree.id) || childTree.id;
      hatIds.push(id);
    });
  }

  // needs to be optimised
  const hatsData = await fetchHatsDetails(hatIds, chainId);
  const detailsFields = hatsData.map((hat: any) => hat.details);
  const details = await fetchMultipleHatsDetails(detailsFields);
  console.log(
    _.concat(
      _.map(_.flatten(hatsData.map((hat: any) => hat.wearers)), 'id'),
      _.map(_.flatten(hatsData.map((hat: any) => hat.toggle)), 'id'),
      _.map(_.flatten(hatsData.map((hat: any) => hat.eligibility)), 'id'),
    ),
  );
  const wearersAndControllersArray = _.uniq(
    _.filter(
      _.concat(
        _.map(_.flatten(hatsData.map((hat: any) => hat.wearers)), 'id'),
        _.map(_.flatten(hatsData.map((hat: any) => hat.toggle)), 'id'),
        _.map(_.flatten(hatsData.map((hat: any) => hat.eligibility)), 'id'),
      ),
      (d) => d !== ZERO_ADDRESS && d !== undefined,
    ),
  );
  // console.log(wearersAndControllersArray);

  const wearersAndControllersInfo = await fetchManyWearerDetails(
    wearersAndControllersArray,
    chainId,
  );
  // console.log(wearersAndControllersInfo);

  const parentsAndIds = hatsData.map((hat: any) => ({
    id: hat.prettyId,
    parentId: hat.admin.prettyId,
  }));

  const hierarchy = createHierarchy(parentsAndIds);

  const hats = Object.fromEntries(
    hatsData.map((hat: any, index) => [
      hat.id,
      {
        ...hat,
        parentId: hat.admin.prettyId,
        details: details[index],
      },
    ]),
  );

  treeData?.hats?.forEach(async (hat: any) => {
    let hatParent = hat.admin?.prettyId;
    if (hat.admin.prettyId === hat.prettyId) {
      hatParent = null;
    }

    const {
      prettyId,
      id,
      tree: { id: treeId },
    } = hat;

    const wearers = await extendWearers(
      hats[id].wearers,
      wearersAndControllersInfo,
    );
    const eligibility = await extendControllers(
      hats[id].eligibility,
      wearersAndControllersInfo,
    );
    const toggle = await extendControllers(
      hats[id].toggle,
      wearersAndControllersInfo,
    );

    hatsArray.push({
      id: prettyId,
      name: prettyIdToIp(prettyId),
      parentId: hatParent,
      imageURI: hatIdToImage[id],
      treeId,
      isLinked: false,
      url: `/trees/${chainId}/${decimalId(treeId)}`,
      details: hats[id].details,
      active: hats[id].status,
      currentSupply: hats[id].currentSupply,
      maxSupply: hats[id].maxSupply,
      wearers,
      eligibility,
      toggle,
      levelAtLocalTree: hats[id].levelAtLocalTree,
    });
  });

  // If the tree is linkedToHat, add it to the hatsArray with the childOfTree id as its parent
  if (treeData?.linkedToHat) {
    const {
      prettyId,
      id,
      tree: { id: treeId },
    } = treeData.linkedToHat;

    hatsArray.push({
      id: prettyId,
      name: prettyIdToIp(prettyId),
      parentId: null,
      imageURI: hatIdToImage[id],
      treeId,
      isLinked: true,
      url: `/trees/${chainId}/${decimalId(treeId)}`,
      details: hats[id].details,
      active: hats[id].status,
      currentSupply: hats[id].currentSupply,
      maxSupply: hats[id].maxSupply,
      wearers: hats[id].wearers,
      levelAtLocalTree: hats[id].levelAtLocalTree,
    });
  }

  // If the tree has parentOfTrees, add them to the hatsArray with the linkedToHat as their parent
  if (treeData?.parentOfTrees) {
    treeData.parentOfTrees.forEach((childTree: ITree) => {
      if (!childTree.linkedToHat) return;
      const {
        linkedToHat: { prettyId },
        id: treeId,
      } = childTree;
      const id = prettyIdToId(treeId);

      if (!id) return;

      hatsArray.push({
        id: treeId,
        name: treeId,
        parentId: prettyId,
        imageURI: id ? hatIdToImage[id] : undefined,
        treeId,
        isLinked: true,
        url: `/trees/${chainId}/${decimalId(treeId)}`,
        details: id && hats[id]?.details,
        active: id && hats[id]?.status,
        currentSupply: hats[id].currentSupply,
        maxSupply: hats[id].maxSupply,
        wearers: hats[id].wearers,
        levelAtLocalTree: hats[id].levelAtLocalTree,
      });
    });
  }

  return { tree: hatsArray, hats, hierarchy };
}

export function createHierarchy(data: InputObject[]): HierarchyObject[] {
  // Sort by parentId and id
  data.sort(
    (a, b) => a.parentId.localeCompare(b.parentId) || a.id.localeCompare(b.id),
  );

  // Create initial hierarchy objects
  const hierarchyObjects: HierarchyObject[] = data.map((obj) => ({
    id: obj.id,
    parentId: obj.id === obj.parentId ? null : obj.parentId,
    firstChild: null,
    leftSibling: null,
    rightSibling: null,
  }));

  // Add firstChild, leftSibling, rightSibling
  for (let i = 0; i < hierarchyObjects.length; i++) {
    const current = hierarchyObjects[i];

    // Find siblings and first child
    const siblings = hierarchyObjects.filter(
      (node) => node.parentId === current.parentId,
    );

    for (let j = 0; j < siblings.length; j++) {
      if (current.id > siblings[j].id) {
        // Sibling is a left sibling if its id is smaller
        current.leftSibling = siblings[j].id;
      } else if (current.id < siblings[j].id) {
        // Sibling is a right sibling if its id is bigger and current right sibling is null or its id is bigger than the sibling
        if (
          current.rightSibling === null ||
          siblings[j].id < current.rightSibling
        ) {
          current.rightSibling = siblings[j].id;
        }
      }
    }

    // Find first child
    const children = hierarchyObjects.filter(
      (node) => node.parentId === current.id,
    );
    if (children.length > 0) {
      current.firstChild = children[0].id;
    }
  }

  return hierarchyObjects;
}

export function prettyIdToId(id: string | undefined) {
  if (!id) return '';
  return id?.replaceAll('.', '').padEnd(66, '0');
}

export function idToPrettyId(id: string | undefined) {
  if (!id) return '';
  const treeId = id?.slice(0, 10);
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
    // console.log(e);
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

export function urlIdToPrettyId(id: string) {
  try {
    const parts = _.split(id, '_');
    const start = _.first(parts);
    if (!start) return '';
    const treeId = `0x${BigInt(start).toString(16)?.padStart(8, '0')}`;
    const children = parts?.slice(1)?.map((child) => {
      return BigInt(child).toString(16).padStart(4, '0');
    });

    return _.join([treeId, ...children], '.');
  } catch (e: any) {
    // console.log(e);
    return '';
  }
}

export function prettyIdToUrlId(id: string, topOnly = false) {
  if (!id) return '';
  const treeId = decimalId(id.slice(0, 10));
  const children = id.slice(11, 66);
  if (topOnly || !children) return treeId;

  const childrenIds = _.split(children, '.');
  const test = _.map(childrenIds, (index) => {
    return BigInt(`0x${index}`).toString();
  });
  const joined = _.join([treeId, ...test], '_');
  return joined;
}

export const hatIdToHex = (hatId: string | null) => {
  if (!hatId) return undefined;
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

const includesAny = (arr: any[], target: any[]) =>
  target.some((v) => arr.includes(v));

/**
 * @param hatId should be a `prettyId`
 * @param wearerHatIds should be an array of `prettyId`s worn by the wearer
 * @param current default `false`, include wearing current hatId
 */
export const isAdmin = (
  wearerHatIds: string[],
  hatId?: string,
  current = false,
) => {
  if (!hatId) return false;
  const treeId = hatId.slice(0, 10);
  // separate children IDs
  const children = hatId.slice(11);
  const parentHats = _.split(children, '.');
  // remove the current hat Id
  if (!current) {
    parentHats.pop();
  }

  // map all hatIds for the lineage
  const hatIds = _.map(
    parentHats,
    (__, i) => `${treeId}.${_.join(parentHats.slice(0, i + 1), '.')}`,
  );
  // include the treeId
  hatIds.push(treeId);

  if (!wearerHatIds) return false;
  // check if any of the wearer hats' IDs are admin hat IDs
  return !!includesAny(wearerHatIds, hatIds);
};

export const isTopHat = (hatData: any) =>
  _.get(hatData, 'levelAtLocalTree') === 0 &&
  _.get(hatData, 'admin.prettyId') === _.get(hatData, 'prettyId');

export const isMutable = (hatData: any) => _.get(hatData, 'mutable');

export const isTopHatOrMutable = (hatData: any) =>
  isTopHat(hatData) || isMutable(hatData);

export const isMutableNotTopHat = (hatData: any) =>
  isMutable(hatData) && !isTopHat(hatData);

export const descendantsOf = (
  prettyHatId: string,
  tree: any,
  onlyChildren = false,
) => {
  if (!prettyHatId || !tree) return false;
  // exclude current hat
  const hats = _.filter(_.get(tree, 'hats'), (h) => h.prettyId !== prettyHatId);

  // remaining descendants in the tree
  const allDescendants = _.filter(hats, (h) =>
    _.includes(_.get(h, 'prettyId'), prettyHatId),
  );

  if (!onlyChildren) return allDescendants;

  const directChildren = _.filter(allDescendants, (h) => {
    const currentHatLength = _.size(prettyHatId);
    const parentHatLength = _.size(_.get(h, 'prettyId'));
    // better way to calculate this?
    return _.eq(_.subtract(parentHatLength, currentHatLength), 5);
  });
  return directChildren;
};

export const getTreeId = (prettyHatId: string | null) => {
  if (!prettyHatId) return '';
  return prettyHatId.slice(0, 10);
};
