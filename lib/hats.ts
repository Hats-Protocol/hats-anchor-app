/* eslint-disable no-plusplus */
import _ from 'lodash';

import { ZERO_ADDRESS } from '@/constants';
import { fetchHatsDetails, fetchManyWearerDetails } from '@/gql/helpers';
import { fetchMultipleHatsDetails } from '@/hooks/useHatDetailsField';
import { extendControllers, extendWearers } from '@/lib/contract';
import { HierarchyObject, IHat, IHatData, InputObject, ITree } from '@/types';

export async function toTreeStructure({
  treeData,
  hatsImages,
  chainId,
}: {
  treeData: ITree;
  hatsImages: IHat[] | undefined;
  chainId: number;
}): Promise<{
  tree: IHat[];
  hats: IHatData[];
  hierarchy: HierarchyObject[];
}> {
  if (!treeData || !hatsImages)
    return Promise.resolve({ tree: [], hats: [], hierarchy: [] });
  const hatsArray: IHat[] = [];

  const hatIds: string[] = _.uniq(
    _.concat(
      _.map(treeData?.hats, 'id'),
      treeData.linkedToHat?.id ? [treeData.linkedToHat?.id] : [],
      _.map(treeData?.parentOfTrees, (t) => prettyIdToId(t.id)),
    ),
  );

  // needs to be optimised
  let hatsData = await fetchHatsDetails(hatIds, chainId);
  const detailsFields = hatsData.map((hat: IHat) => hat.details);
  const details = await fetchMultipleHatsDetails(detailsFields);
  hatsData = _.map(hatsData, (hat: IHat, index: number) => {
    const imageUrl = _.find(hatsImages, ['id', hat.id])?.imageUrl;
    return {
      ...hat,
      imageUrl,
      detailsObject: details[index],
    };
  });

  const wAndCs = _.uniq(
    _.filter(
      _.concat(
        _.map(_.flatten(hatsData.map((hat: IHat) => hat.wearers)), 'id'),
        _.map(_.flatten(hatsData.map((hat: IHat) => hat.toggle)), 'id'),
        _.map(_.flatten(hatsData.map((hat: IHat) => hat.eligibility)), 'id'),
      ),
      (d) => d !== ZERO_ADDRESS && d !== undefined,
    ),
  );
  const wAndCInfo = await fetchManyWearerDetails(wAndCs, chainId);

  const parentsAndIds = hatsData.map((hat: IHat) => ({
    id: hat.prettyId,
    parentId: hat.admin.prettyId,
  }));

  const hierarchy = createHierarchy(parentsAndIds);

  treeData?.hats?.forEach(async (hat: IHat) => {
    let parentId: string | null = hat.admin?.prettyId;
    if (hat.admin?.prettyId === hat.prettyId) {
      parentId = null;
    }

    const {
      prettyId,
      id,
      tree: { id: treeId },
    } = hat;

    const currentHat = _.find(hatsData, { id });

    hatsArray.push({
      ...currentHat,
      id: prettyId,
      name: prettyIdToIp(prettyId),
      parentId,
      treeId,
      isLinked: false,
      url: `/trees/${chainId}/${decimalId(treeId)}`,
      wearers: extendWearers(currentHat.wearers, wAndCInfo),
      eligibility: extendControllers(currentHat.eligibility, wAndCInfo),
      toggle: extendControllers(currentHat.toggle, wAndCInfo),
    });
  });

  // If the tree is linkedToHat, add it to the hatsArray with the childOfTree id as its parent
  if (treeData?.linkedToHat) {
    const {
      prettyId,
      id,
      tree: { id: treeId },
      imageUrl,
    } = treeData.linkedToHat;

    const currentHat = _.find(hatsData, { id });

    hatsArray.push({
      ...currentHat,
      id: prettyId,
      name: prettyIdToIp(prettyId),
      parentId: null,
      imageUrl,
      treeId,
      isLinked: true,
      url: `/trees/${chainId}/${decimalId(treeId)}`,
      wearers: extendWearers(currentHat.wearers, wAndCInfo),
      eligibility: extendControllers(currentHat.eligibility, wAndCInfo),
      toggle: extendControllers(currentHat.toggle, wAndCInfo),
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
      const id = prettyIdToId(prettyId);

      if (!id) return;
      const currentHat = _.find(hatsData, { id });

      hatsArray.push({
        ...currentHat,
        id: treeId,
        name: decimalId(treeId),
        parentId: idToPrettyId(id),
        treeId,
        isLinked: true,
        url: `/trees/${chainId}/${decimalId(treeId)}`,
        wearers: extendWearers(currentHat.wearers, wAndCInfo),
        eligibility: extendControllers(currentHat.eligibility, wAndCInfo),
        toggle: extendControllers(currentHat.toggle, wAndCInfo),
      });
    });
  }

  return Promise.resolve({ tree: hatsArray, hats: hatsData, hierarchy });
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

export const hatIdToHex = (hatId: string | null) => {
  if (!hatId) return '';
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
  const hats = _.split(children, '.');

  if (!current) hats.pop();

  // map all parent hatIds for the lineage
  const hatIds = hats.map((__, i) => {
    const joinedParentHats = hats.slice(0, i).join('.');
    return `${treeId}${i > 0 ? `.${joinedParentHats}` : ''}`;
  });

  if (!wearerHatIds) return false;
  // check if any of the wearer hats' IDs are admin of any parent hat IDs
  return !!includesAny(wearerHatIds, hatIds);
};

export const isTopHat = (hatData: IHat) =>
  _.get(hatData, 'levelAtLocalTree') === 0 &&
  _.get(hatData, 'admin.prettyId') === _.get(hatData, 'prettyId');

export const isMutable = (hatData: IHat) => _.get(hatData, 'mutable');

export const isTopHatOrMutable = (hatData: IHat) =>
  isTopHat(hatData) || isMutable(hatData);

export const isMutableNotTopHat = (hatData: IHat) =>
  isMutable(hatData) && !isTopHat(hatData);

export const descendantsOf = (
  prettyHatId: string,
  tree: ITree,
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

export const getTreeId = (prettyHatId: string | null, full = false) => {
  if (!prettyHatId) return '';
  if (!full) return prettyHatId.slice(0, 10);
  return prettyHatId.slice(0, 10).padEnd(66, '0');
};
