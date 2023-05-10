/* eslint-disable no-use-before-define */
import _ from 'lodash';
import { BigNumber } from 'ethers';

export function arrayToTreeRecursive(arr, parent) {
  return _.map(
    _.filter(arr, (item) => item.hatParent === parent),
    (child) => ({
      name: child.hatName,
      attributes: {
        details: child.details,
        imageURI: child.imageURI,
        dottedLine: child.dottedLine,
        treeId: child.treeId,
      },
      children: arrayToTreeRecursive(arr, child.hatName),
    }),
  );
}

export function toTreeStructure(treeData, hatsData, hatIdToImage) {
  // Map the hats array to include the hatName, hatParent, and imageURI
  const hatsArray = treeData?.hats?.map((hat) => {
    // set the hatParent to the hat's admin.prettyId
    let hatParent = hat.admin?.prettyId;
    // If the hat is an admin of itself, set the hatParent to 'dummy'
    if (hat.admin.prettyId === hat.prettyId) {
      hatParent = 'dummy';
    }
    // If the hat's parent is the linked hat
    if (hat.admin.prettyId === treeData.linkedToHat?.prettyId) {
      hatParent = treeData.linkedToHat?.prettyId;
    }

    return {
      hatName: hat.prettyId,
      hatParent,
      imageURI: hatIdToImage[_.get(hat, 'id')],
      treeId: hat.tree.id,
      dottedLine: hat.admin?.prettyId === treeData.linkedToHat?.prettyId,
    };
  });

  // If the tree is linkedToHat, add it to the hatsArray with the childOfTree id as its parent
  if (treeData?.linkedToHat) {
    hatsArray.push({
      hatName: treeData.linkedToHat.prettyId,
      hatParent: 'dummy',
      imageURI: hatIdToImage[treeData.linkedToHat.id],
      treeId: treeData.linkedToHat.tree.id,
    });
  }

  // If the tree has parentOfTrees, add them to the hatsArray with the linkedToHat as their parent
  if (treeData?.parentOfTrees) {
    treeData.parentOfTrees.forEach((childTree) => {
      hatsArray.push({
        hatName: childTree.id,
        hatParent: childTree.linkedToHat.prettyId,
        imageURI: hatIdToImage[prettyIdToId(childTree.id)],
        treeId: childTree.id,
        dottedLine: true,
      });
    });
  }

  if (!hatsArray) return [];

  return arrayToTreeRecursive(
    [{ hatName: 'dummy', hatParent: 'null' }, ...hatsArray],
    'dummy',
  );
}

export function prettyIdToId(id) {
  return id?.replaceAll('.', '').padEnd(66, '0');
}

export function idToPrettyId(id) {
  if (!id) return '';
  const treeId = id?.slice(0, 10);
  if (id.length === 10) return treeId;
  const children = id?.slice(10);
  const childArray = children?.match(/.{1,4}/g);
  const dropEmpty = _.dropRightWhile(childArray, (child) => child === '0000');
  return _.join([treeId, ...dropEmpty], '.');
}

export function prettyIdToIp(id) {
  if (!id) return '';
  const domains = id
    ?.slice(2)
    ?.split('.')
    ?.map((hexDomain) => {
      return parseInt(hexDomain, 16);
    });

  return domains.join('.');
}

export const toTreeId = (id) => {
  if (!id) return '0x';
  try {
    const bn = BigNumber.from(id?.slice(0, 10));
    return `0x${bn.toHexString().slice(2).padStart(8, '0')}`;
  } catch (e) {
    // console.log(e);
    return '0x';
  }
};

export function ipToPrettyId(id) {
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

export function urlIdToPrettyId(id) {
  try {
    const parts = _.split(id, '_');
    const treeId = `0x${BigNumber.from(_.first(parts))
      .toHexString()
      ?.slice(2)
      ?.padStart(8, '0')}`;
    const children = parts?.slice(1)?.map((child) => {
      return BigNumber.from(child).toHexString().slice(2).padStart(4, '0');
    });

    return _.join([treeId, ...children], '.');
  } catch (e) {
    // console.log(e);
    return '';
  }
}

export function prettyIdToUrlId(id, topOnly = false) {
  const treeId = decimalId(id.slice(0, 10));
  const children = id.slice(11, 66);
  if (topOnly || !children) return treeId;

  const childrenIds = _.split(children, '.');
  const test = _.map(childrenIds, (index) => {
    return BigNumber.from(`0x${index}`).toString();
  });
  const joined = _.join([treeId, ...test], '_');
  return joined;
}

export const hatIdToHex = (hatId) => {
  if (!hatId) return null;
  return `0x${BigNumber.from(hatId).toHexString().slice(2).padStart(64, '0')}`;
};

// treeId is a decimal string '5'
export const decimalToTreeId = (treeId) => {
  if (!treeId) return null;
  return `0x${BigNumber.from(treeId).toHexString().slice(2).padStart(8, '0')}`;
};

export const decimalIdToId = (decimalId) => {
  if (!decimalId) return '0x';
  try {
    const bn = BigNumber.from(decimalId);
    return `0x${bn.toHexString().slice(2).padStart(64, '0')}`;
  } catch (err) {
    return '0x';
  }
};

export const decimalId = (hatId) => {
  if (!hatId) return null;

  try {
    return BigNumber.from(hatId).toString();
  } catch (err) {
    return '0x';
  }
};

const includesAny = (arr, target) => target.some((v) => arr.includes(v));

/**
 * @param hatId should be a `prettyId`
 * @param wearerHatIds should be an array of `prettyId`s worn by the wearer
 * @param current default `false`, include wearing current hatId
 */
export const isAdmin = (hatId, wearerHatIds, current = false) => {
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

export const isTopHat = (hatData) => _.get(hatData, 'levelAtLocalTree') === 0;

export const isMutable = (hatData) => _.get(hatData, 'mutable');

export const isTopHatOrMutable = (hatData) =>
  isTopHat(hatData) || isMutable(hatData);

export const isMutableNotTopHat = (hatData) =>
  isMutable(hatData) && !isTopHat(hatData);

export const descendantsOf = (prettyHatId, tree, onlyChildren = false) => {
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

export const getTreeId = (prettyHatId) => {
  if (!prettyHatId) return null;
  return prettyHatId.slice(0, 10);
};
