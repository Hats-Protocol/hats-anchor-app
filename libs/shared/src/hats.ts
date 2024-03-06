import _ from 'lodash';
import { Hierarchy, InputObject } from 'types';
import { Hex } from 'viem';

/**
 * Maps the provided objects with chainId as an additional parameter
 * @param array objects to include the chainId property
 * @param chainId current chainId to include with the objects
 * @returns array of objects with additional chainId property
 */
export const mapWithChainId = (
  array: object[] | undefined,
  chainId: number,
): object[] => _.map(array, (obj: object) => ({ ...obj, chainId }));

/**
 * Returns an object with the selected Hat's nearest siblings, parent and first child
 * @param data array of Partial<Hats> for determining ID relations
 * @param currentHatId the currently selected Hat ID
 * @returns Hierarchy object with nearest siblings, parent and first child
 */
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
          (hat: any) =>
            hat.parentId === currentHat.parentId && hat.id !== hat.parentId,
        )
      : [];

  const sortedSiblings = _.sortBy(siblings, (sibling: any) =>
    BigInt(sibling.id),
  );
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
      (item: any) => item.parentId === currentHatId && item.id !== currentHatId,
    ),
    'id',
  );

  currentHierarchy.firstChild = _.first(children)?.id as Hex;

  return currentHierarchy;
}
