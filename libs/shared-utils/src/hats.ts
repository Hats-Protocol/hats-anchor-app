import { Hierarchy, InputObject } from 'hats-types';
import _ from 'lodash';
import { Hex } from 'viem';

export const mapWithChainId = (
  array: object[] | undefined,
  chainId: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any[] => _.map(array, (obj: object) => ({ ...obj, chainId }));

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
