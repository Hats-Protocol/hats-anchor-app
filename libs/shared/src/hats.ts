import {
  filter,
  find,
  findIndex,
  first,
  get,
  last,
  map,
  slice,
  sortBy,
} from 'lodash';
import { AppHat, Hierarchy, InputObject } from 'types';
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
): object[] => map(array, (obj: object) => ({ ...obj, chainId }));

// TODO need to handle inactive hats in hierarchy, e.g. don't link to them
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

  const currentHat = find(data, { id: currentHatId });
  if (!currentHat) return {} as Hierarchy;

  const currentHierarchy: Hierarchy = {
    id: currentHat.id,
    parentId: (currentHat.id === currentHat.parentId
      ? null
      : currentHat.parentId) as Hex,
  };

  let siblings: Partial<AppHat>[] = [];
  if (currentHat.parentId !== currentHat.id) {
    siblings = filter(
      data as Partial<AppHat>[],
      (hat: Partial<AppHat>) =>
        hat.parentId === currentHat.parentId && hat.id !== hat.parentId,
    );
  }

  const sortedSiblings = sortBy(siblings, (sibling: AppHat) =>
    BigInt(sibling.id),
  );
  const currentHatIndex = findIndex(sortedSiblings, { id: currentHat.id });
  const leftSiblings = slice(sortedSiblings, 0, currentHatIndex);
  const rightSiblings = slice(sortedSiblings, currentHatIndex + 1);
  currentHierarchy.leftSiblings = map(leftSiblings, 'id');
  currentHierarchy.rightSiblings = map(rightSiblings, 'id');
  currentHierarchy.leftSibling = get(last(leftSiblings), 'id') as Hex;
  currentHierarchy.rightSibling = get(first(rightSiblings), 'id') as Hex;

  const children = sortBy(
    filter(
      data,
      (h: AppHat) => h.parentId === currentHatId && h.id !== currentHatId,
    ),
    'id',
  );

  currentHierarchy.firstChild = get(first(children), 'id') as Hex;

  return currentHierarchy;
}
