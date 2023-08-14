/* eslint-disable no-plusplus */
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';

import { defaultHat, ZERO_ADDRESS } from '@/constants';
import { fetchManyHatDetails, fetchManyWearerDetails } from '@/gql/helpers';
import { fetchMultipleHatsDetails } from '@/hooks/useHatDetailsField';
import { extendControllers, extendWearers } from '@/lib/contract';
import { HierarchyObject, IControls, IHat, InputObject, ITree } from '@/types';

// todo use query hook
export async function toTreeStructure({
  treeData,
  hatsImages,
  chainId,
  editMode,
}: {
  treeData: ITree | null | undefined;
  hatsImages: IHat[] | undefined;
  chainId: number;
  editMode: boolean;
}): Promise<IHat[]> {
  if (!treeData || !hatsImages) return Promise.resolve([]);
  const hatsArray: any[] = [];

  const hatIds: string[] = _.uniq(
    _.concat(
      _.map(treeData?.hats, 'id'),
      treeData.linkedToHat?.id ? [treeData.linkedToHat?.id] : [],
      _.map(treeData?.parentOfTrees, (t) => prettyIdToId(t.id)),
    ),
  );

  // needs to be optimised
  let hatsData = await fetchManyHatDetails(hatIds, chainId);
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

  treeData?.hats?.forEach(async (hat: IHat) => {
    let parentId: string | undefined = hat.admin?.id;
    if (hat.admin?.id === hat.id) {
      parentId = undefined;
    }

    const { id, tree } = hat;
    let treeId;
    if (tree) {
      treeId = tree.id;
    }

    const currentHat = _.find(hatsData, { id });
    if (!currentHat) return;

    hatsArray.push({
      ...currentHat,
      type: 'hat',
      id,
      name: hatIdDecimalToIp(BigInt(id)),
      parentId,
      treeId,
      isLinked: false,
      url: `/trees/${chainId}/${decimalId(treeId)}`,
      extendedWearers: extendWearers(currentHat.wearers, wAndCInfo),
      extendedEligibility: extendControllers(currentHat.eligibility, wAndCInfo),
      extendedToggle: extendControllers(currentHat.toggle, wAndCInfo),
    });
  });

  // If the tree is linkedToHat, add it to the hatsArray with the childOfTree id as its parent
  if (treeData?.linkedToHat) {
    const { id, tree, imageUrl } = treeData.linkedToHat;
    let treeId;
    if (tree) {
      treeId = tree.id;
    }

    const currentHat = _.find(hatsData, { id });
    if (currentHat) {
      hatsArray.push({
        ...currentHat,
        type: 'hat',
        id,
        name: hatIdDecimalToIp(BigInt(id)),
        parentId: null,
        imageUrl,
        treeId,
        isLinked: true,
        url: `/trees/${chainId}/${decimalId(treeId)}`,
        extendedWearers: extendWearers(currentHat.wearers, wAndCInfo),
        extendedEligibility: extendControllers(
          currentHat.eligibility,
          wAndCInfo,
        ),
        extendedToggle: extendControllers(currentHat.toggle, wAndCInfo),
      });
    }
  }

  // If the tree has parentOfTrees, add them to the hatsArray with the linkedToHat as their parent
  if (treeData?.parentOfTrees) {
    treeData.parentOfTrees.forEach((childTree: ITree) => {
      if (!childTree.linkedToHat) return;
      const {
        linkedToHat: { id },
        id: treeId,
      } = childTree;

      if (!id) return;
      const currentHat = _.find(hatsData, { id });
      if (!currentHat) return;

      hatsArray.push({
        ...currentHat,
        type: 'hat',
        id: treeId,
        name: hatIdDecimalToIp(BigInt(treeId)),
        parentId: id,
        treeId,
        isLinked: true,
        url: `/trees/${chainId}/${decimalId(treeId)}`,
        extendedWearers: extendWearers(currentHat.wearers, wAndCInfo),
        extendedEligibility: extendControllers(
          currentHat.eligibility,
          wAndCInfo,
        ),
        extendedToggle: extendControllers(currentHat.toggle, wAndCInfo),
      });
    });
  }

  if (!editMode) return Promise.resolve(hatsArray);

  const siblingArrays: IHat[][] = [];
  const addChildHats: IHat[] = [];
  // get sibling rows
  _.map(hatsArray, (hat: IHat) => {
    const siblings: IHat[] = _.filter(hatsArray, { parentId: hat.id });
    if (siblings.length > 0) {
      siblingArrays.push(siblings);
    }
  });
  // add new hat (button) for each sibling row
  const parentsToRemove: IHat[] = [];
  siblingArrays.forEach((siblings) => {
    const sibling: IHat | undefined = _.last(siblings);
    if (!sibling) return;
    const nameSplit = _.split(sibling.name, '.');
    const parentId = _.dropRight(nameSplit, 1).join('.');
    const newChildId = _.toNumber(_.last(nameSplit)) + 1;
    const addChildHat = {
      ...defaultHat,
      chainId,
      type: 'new',
      id: prettyIdToId(ipToPrettyId(`${parentId}.${newChildId}`)),
      parentId: sibling.parentId,
      name: `${parentId}.${newChildId}`,
      details: 'Create new child hat here',
    };
    addChildHats.push(addChildHat);
    const parent = _.find(hatsArray, { id: sibling.parentId });
    if (!parent) return;
    parentsToRemove.push(parent);
  });
  // add new hat (button) for each hat without children
  const childrenToAdd = _.difference(hatsArray, parentsToRemove);
  _.forEach(childrenToAdd, (child) => {
    const newChildId = `${child.name}.1`;
    const newChild = {
      ...defaultHat,
      chainId,
      type: 'new',
      id: prettyIdToId(ipToPrettyId(newChildId)),
      parentId: child.id,
      name: newChildId,
      details: 'Create new child hat here',
    };
    addChildHats.push(newChild);
  });
  const withNewHats = _.concat(hatsArray, addChildHats);

  return Promise.resolve(withNewHats);
}

export function createHierarchy(data: InputObject[]): HierarchyObject[] {
  // Sort by parentId and id
  data.sort(
    (a, b) =>
      a.parentId?.localeCompare(b?.parentId || '') || a.id.localeCompare(b.id),
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
          siblings[j].id < (current.rightSibling || 0)
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

// HACK UNTIL FUNCTION AVAILABLE IN SDK
export function ipToHatId(id: string) {
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
export const isAdmin = (
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

export const isMutable = (hatData: IHat) => _.get(hatData, 'mutable');

export const isTopHatOrMutable = (hatData: IHat) =>
  isTopHat(hatData) || isMutable(hatData);

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
  orgChartTree: IHat[],
  controls: IControls[],
) => {
  const hasPermissions = !_.isEmpty(
    _.filter(orgChartTree, (node: IHat) =>
      checkNodeDetails(node, 'permissions'),
    ),
  );
  const hasResponsibilities = !_.isEmpty(
    _.filter(orgChartTree, (node: IHat) =>
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

export const nextChildId = (admin: string | undefined, children: IHat[]) => {
  if (!admin) return '1';
  const decimalAdmin = hatIdDecimalToIp(BigInt(admin));
  let nextChild = `${decimalAdmin}.1`;
  if (!_.isEmpty(children)) {
    // can we get away from prettyId here?
    const lastChildId = _.toNumber(
      _.nth(_.split(_.get(_.last(children), 'prettyId'), '.'), 1),
    );
    nextChild = `${decimalAdmin}.${lastChildId + 1}`;
  }
  return nextChild;
};
