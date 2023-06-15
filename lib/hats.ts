/* eslint-disable no-use-before-define */
import { HatData } from '@/components/OrgChart';
import { fetchHatsDetails } from '@/gql/helpers';
import { fetchMultipleHatsDetails } from '@/hooks/useHatDetailsField';

import _ from 'lodash';

export async function toTreeStructure(
  treeData: any,
  hatIdToImage: any,
  chainId: number,
): Promise<HatData[]> {
  const hatsArray: HatData[] = [];
  const hatIds: string[] = [];

  treeData?.hats?.forEach((hat: any) => {
    hatIds.push(hat.id);
  });

  if (treeData?.linkedToHat) {
    hatIds.push(treeData.linkedToHat.id);
  }

  if (treeData?.parentOfTrees) {
    treeData.parentOfTrees.forEach((childTree: any) => {
      hatIds.push(childTree.id);
    });
  }

  // needs to be optimised
  const hatsData = await fetchHatsDetails(hatIds, chainId);
  const detailsFields = hatsData.map((hat: any) => hat.details);
  const details = await fetchMultipleHatsDetails(detailsFields);

  const hats = Object.fromEntries(
    hatsData.map((hat: any, index) => [
      hat.id,
      {
        ...hat,
        details: details[index],
      },
    ]),
  );

  treeData?.hats?.forEach((hat: any) => {
    let hatParent = hat.admin?.prettyId;
    if (hat.admin.prettyId === hat.prettyId) {
      hatParent = null;
    }
    const treeId = hat.tree.id;
    const { prettyId, id } = hat;

    hatsArray.push({
      id: prettyId,
      name: prettyIdToIp(prettyId),
      parentId: hatParent,
      imageURI: hatIdToImage[id],
      treeId,
      dottedLine: hat.admin?.prettyId === treeData.linkedToHat?.prettyId,
      url: `/trees/${chainId}/${decimalId(treeId)}/${prettyIdToUrlId(
        prettyId,
      )}`,
      details: hats[id].details,
      active: hats[id].status,
    });
  });

  // If the tree is linkedToHat, add it to the hatsArray with the childOfTree id as its parent
  if (treeData?.linkedToHat) {
    const treeId = treeData.linkedToHat.tree.id;
    const { prettyId, id } = treeData.linkedToHat;

    hatsArray.push({
      id: prettyId,
      name: prettyId,
      parentId: null,
      imageURI: hatIdToImage[id],
      treeId,
      dottedLine: false,
      url: `/trees/${chainId}/${decimalId(treeId)}/${prettyIdToUrlId(
        prettyId,
      )}`,
      details: hats[id].details,
      active: hats[id].status,
    });
  }

  // If the tree has parentOfTrees, add them to the hatsArray with the linkedToHat as their parent
  if (treeData?.parentOfTrees) {
    treeData.parentOfTrees.forEach((childTree: any) => {
      const id = prettyIdToId(childTree.id);
      const treeId = childTree.id;
      const { prettyId } = childTree.linkedToHat;

      hatsArray.push({
        id: treeId,
        name: treeId,
        parentId: prettyId,
        imageURI: id ? hatIdToImage[id] : undefined,
        treeId,
        dottedLine: true,
        url: `/trees/${chainId}/${decimalId(treeId)}/${prettyIdToUrlId(
          prettyId,
        )}`,
        details: id && hats[id]?.details,
        active: id && hats[id].status,
      });
    });
  }

  return hatsArray;
}

export function prettyIdToId(id: string | undefined) {
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
  hatId: string,
  wearerHatIds: string[],
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
