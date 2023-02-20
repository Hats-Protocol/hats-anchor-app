import _ from 'lodash';
import { BigNumber } from 'ethers';

export function arrayToTreeRecursive(arr, parent) {
  return _.map(
    _.filter(arr, (item) => item.hatParent === parent),
    (child) => ({
      name: child.hatName,
      attributes: { details: child.details },
      children: arrayToTreeRecursive(arr, child.hatName),
    }),
  );
}

export function toTreeStructure(data) {
  const hatsArray = data.hats?.map((hat) => {
    if (hat.admin?.prettyId === hat.prettyId) {
      return { hatName: hat.prettyId, hatParent: 'dummy' };
    }
    return {
      hatName: hat.prettyId,
      hatParent: hat.admin?.prettyId,
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

export const hatIdToHex = (hatId) => {
  if (!hatId) return null;
  return `0x${BigNumber.from(hatId).toHexString().slice(2).padStart(64, '0')}`;
};

export const decimalId = (hatId) => {
  if (!hatId) return null;
  return BigNumber.from(hatId).toString();
};
