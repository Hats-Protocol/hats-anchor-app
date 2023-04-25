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

export function toTreeStructure(data, hatIdToImage) {
  // Map the hats array to include the hatName, hatParent, and imageURI
  const hatsArray = data?.hats?.map((hat) => {
    // If the hat is an admin of itself, set the hatParent to 'dummy'
    if (hat.admin.prettyId === hat.prettyId) {
      return {
        hatName: hat.prettyId,
        hatParent: 'dummy',
        imageURI: hatIdToImage[hat.id],
        treeId: hat.tree.id,
      };
    }

    // If the hat's parent is the linked hat
    if (hat.admin.prettyId === data.linkedToHat?.prettyId) {
      return {
        hatName: hat.prettyId,
        hatParent: data.linkedToHat?.prettyId,
        imageURI: hatIdToImage[hat.prettyId],
        treeId: hat.tree.id,
        dottedLine: true,
      };
    }

    // For all other hats, set the hatParent to the hat's admin.prettyId
    return {
      hatName: hat.prettyId,
      hatParent: hat.admin?.prettyId,
      imageURI: hatIdToImage[hat.id],
      treeId: hat.tree.id,
    };
  });

  // If the tree is linkedToHat, add it to the hatsArray with the childOfTree id as its parent
  if (data?.linkedToHat) {
    hatsArray.push({
      hatName: data.linkedToHat.prettyId,
      hatParent: data.childOfTree?.id,
      imageURI: hatIdToImage[data.linkedToHat.prettyId],
      treeId: data.linkedToHat.tree.id,
    });
  }

  // If the tree is also childOfTree, add it to the hatsArray as the root node
  if (data?.childOfTree) {
    hatsArray.push({
      hatName: data.childOfTree.id,
      hatParent: 'dummy',
      imageURI: hatIdToImage[data.childOfTree.id],
      treeId: data.childOfTree.id,
    });
  }

  // If the tree has parentOfTrees, add them to the hatsArray with the linkedToHat as their parent
  if (data?.parentOfTrees) {
    data.parentOfTrees.forEach((childTree) => {
      hatsArray.push({
        hatName: childTree.id,
        hatParent: childTree.linkedToHat.prettyId,
        imageURI: hatIdToImage[childTree.id],
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
  return id.replaceAll('.', '').padEnd(66, '0');
}

export function prettyIdToIp(id) {
  const domains = id
    .slice(2)
    .split('.')
    .map((hexDomain) => {
      return parseInt(hexDomain, 16);
    });

  return domains.join('.');
}

export function ipToPrettyId(id) {
  const domains = id.split('.').map((domain) => {
    return parseInt(domain, 10).toString(16);
  });

  return `0x${domains.join('.')}`;
}

export function urlIdToPrettyId(id) {
  const test = _.split(id, '_');
  const treeId = `0x${BigNumber.from(_.first(test))
    .toHexString()
    .slice(2)
    .padStart(8, '0')}`;
  const children = test.slice(1).map((child) => {
    return BigNumber.from(child).toHexString().slice(2).padStart(4, '0');
  });

  return _.join([treeId, ...children], '.');
}

export function prettyIdToUrlId(id, topOnly = false) {
  const treeId = decimalId(id.slice(0, 10));
  const children = id.slice(11, 66);

  if (children && !topOnly) {
    const childrenIds = _.split(children, '.');
    const test = _.map(childrenIds, (index) => {
      return BigNumber.from(`0x${index}`).toString();
    });
    const joined = _.join([treeId, ...test], '_');
    return joined;
  }
  return treeId;
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

export const decimalId = (hatId) => {
  if (!hatId) return null;
  return BigNumber.from(hatId).toString();
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

export const topHatOrMutable = (hatData) =>
  _.get(hatData, 'mutable') || _.get(hatData, 'levelAtLocalTree') === 0;

export const mutableNotTopHat = (hatData) =>
  _.get(hatData, 'mutable') && _.get(hatData, 'levelAtLocalTree') !== 0;

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
