import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { concat, filter, find, reduce, size } from 'lodash';
import { AppHat } from 'types';
import { Hex } from 'viem';

// ! missing IDs when inactive are hidden
export const calculateNextChildId = (id: string, hatsData: AppHat[]) => {
  const children = filter(
    hatsData,
    (h: any) => h.admin?.id === id || h.parentId === id,
  );
  const lessTop = filter(children, (child: any) => child.id !== id);
  return `${hatIdDecimalToIp(BigInt(id))}.${size(lessTop) + 1}`;
};

export const getAllParents = (hatId?: Hex, tree?: AppHat[]): AppHat[] => {
  const parents: AppHat[] = [];
  if (!hatId || !tree) return parents;
  let currentHat = find(tree, { id: hatId });

  while (currentHat?.parentId) {
    parents.push(currentHat);
    currentHat = find(tree, { id: currentHat?.parentId });
  }

  return parents;
};

export const getAllDescendants = (hatId: Hex, tree: AppHat[]): AppHat[] => {
  const children = filter(tree, (hat: any) => hat.parentId === hatId);

  const descendants = reduce(
    children,
    (acc: any, child: any) => {
      return concat(acc, child, getAllDescendants(child.id, tree));
    },
    [] as AppHat[],
  );

  return descendants;
};
