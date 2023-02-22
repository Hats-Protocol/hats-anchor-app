/* eslint-disable no-use-before-define */
import _ from 'lodash';
import { BigNumber } from 'ethers';

export function arrayToTreeRecursive(arr, parent) {
  return _.map(
    _.filter(arr, (item) => item.hatParent === parent),
    (child) => ({
      name: child.hatName,
      attributes: { details: child.details, imageURI: child.imageURI },
      children: arrayToTreeRecursive(arr, child.hatName),
    }),
  );
}

export function toTreeStructure(data, hatIdToImage) {
  const hatsArray = data?.hats?.map((hat) => {
    if (hat.admin.prettyId === hat.prettyId) {
      return {
        hatName: hat.prettyId,
        hatParent: 'dummy',
        imageURI: hatIdToImage[hat.id],
      };
    }
    return {
      hatName: hat.prettyId,
      hatParent: hat.admin?.prettyId,
      imageURI: hatIdToImage[hat.id],
    };
  });

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
  console.log(treeId);
  const children = test.slice(1).map((child) => {
    if (child.length < 4) {
      return child.padStart(4, '0');
    }
    return child;
  });
  console.log(children);

  return _.join([treeId, ...children], '.');
}

export function prettyIdToUrlId(id) {
  const treeId = decimalId(id.slice(0, 10));
  const children = id.slice(11, 66);

  if (children) {
    const childrenIds = _.split(children, '.');
    const test = _.map(childrenIds, (index) => {
      return BigNumber.from(index).toString();
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
 */
export const isAdmin = (hatId, wearerHatIds) => {
  const treeId = hatId.slice(0, 10);
  // separate children IDs
  const children = hatId.slice(11);
  const parentHats = _.split(children, '.');
  // remove the current hat Id
  parentHats.pop();

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
