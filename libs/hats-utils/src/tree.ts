import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { Tree } from '@hatsprotocol/sdk-v1-subgraph';
import { AppHat, HatDetails, HatWithDepth, SupportedChains } from 'hats-types';
import _ from 'lodash';
import { idToIp } from 'shared';
import { Hex } from 'viem';

import { decimalId, getTreeId } from './hats';

const mapHat = (
  hat: AppHat | undefined,
  chainId: SupportedChains,
): AppHat | undefined => {
  if (!hat) return undefined;

  return {
    ...hat,
    chainId,
    name: hatIdDecimalToIp(BigInt(hat.id)),
    parentId: hat.admin?.id === hat.id ? undefined : (hat.admin?.id as Hex),
    treeId: hat.tree?.id as Hex,
    isLinked: false,
    url: `/trees/${chainId}/${decimalId(hat.tree?.id)}`,
  };
};

// eslint-disable-next-line import/prefer-default-export
export async function toTreeStructure({
  treeData,
  hatsData,
  detailsData,
  imagesData,
  draftHats,
  chainId,
  initialHatIds,
}: {
  treeData: Tree | null | undefined;
  hatsData: AppHat[] | undefined;
  detailsData: {
    id: string;
    detailsObject: { type: string; data: HatDetails };
  }[];
  imagesData: AppHat[] | undefined;
  draftHats: AppHat[] | undefined;
  chainId: SupportedChains;
  initialHatIds: Hex[];
}): Promise<AppHat[] | undefined> {
  if (!treeData || !hatsData || !detailsData || !imagesData) {
    return Promise.resolve(undefined);
  }
  const onlyOnchainHats = _.filter(hatsData, (hat: AppHat) =>
    _.includes(initialHatIds, hat?.id),
  );

  const mergedHatsData = _.map(onlyOnchainHats, (hat: AppHat) => {
    const fullHat = _.find(hatsData, ['id', hat.id]);
    const details = _.find(detailsData, ['id', hat.details]);
    const image = _.find(imagesData, ['id', hat.id]);

    if (!fullHat) return undefined;

    return {
      ...fullHat,
      detailsObject: details?.detailsObject,
      imageUrl: image?.imageUrl,
    };
  });

  const hats = _.map(initialHatIds, (hat: Hex) =>
    mapHat(_.find(mergedHatsData, ['id', hat]), chainId),
  );

  const hatsList = _.orderBy(
    _.compact(_.concat(hats, draftHats)),
    (h: AppHat) => {
      return _.size(_.split(h.name, '.'));
    },
    'asc',
  );
  const updatedHatsList = hatsList.map((hat: AppHat) =>
    updateHatProperties(
      hat,
      treeData.parentOfTrees,
      (treeData.linkedToHat as AppHat) || null,
    ),
  );

  return Promise.resolve(updatedHatsList);
}

const isHatInParentOfTrees = (
  hat: AppHat,
  parentOfTrees: Tree[] | undefined,
): boolean => {
  return !!_.find(parentOfTrees, { id: getTreeId(hat.id) });
};

const isLinkedToHatFunc = (
  hat: AppHat,
  linkedToHat: AppHat | null,
): boolean => {
  return hat.id === linkedToHat?.id;
};

const updateHatProperties = (
  hat: AppHat,
  parentOfTrees: Tree[] | undefined,
  linkedToHat: AppHat | null,
): AppHat => {
  const updatedHat = { ...hat };

  if (isHatInParentOfTrees(hat, parentOfTrees)) {
    updatedHat.isLinked = true;
  }

  if (isLinkedToHatFunc(hat, linkedToHat)) {
    updatedHat.isLinked = true;
    updatedHat.parentId = undefined;
  }

  return updatedHat;
};

export function prepareMobileTreeHats(tree: AppHat[]): HatWithDepth[] {
  const simplifiedTree: HatWithDepth[] = _.map(tree, (hat: AppHat) => ({
    ...hat,
    ipId: idToIp(hat.id),
  }));

  // * tricky sort ahead, follow each branch to their conclusion
  // * before returning to next sibling at previous level
  const newIdList = simplifiedTree
    ? // start with the top hat
      [_.get(_.first(simplifiedTree), 'ipId')]
    : [];

  _.each(simplifiedTree, (hat: HatWithDepth) => {
    if (_.includes(newIdList, hat.ipId)) return;

    // find the initial hat and all of its children
    const hatAndChildren = _.map(
      _.filter(simplifiedTree, (h: HatWithDepth) => {
        return !_.includes(newIdList, h.ipId) && h.ipId.startsWith(hat.ipId);
      }),
      'id',
    );

    // narrow down the immediate children of the current hat and their respective descendants
    const immediateChildren = _.filter(
      hatAndChildren,
      (id: string) => _.size(hat.ipId.split('.')) + 1 === _.size(id.split('.')),
    );
    const descendantsOfChildren = _.map(immediateChildren, (hId: string) =>
      _.filter(hatAndChildren, (id: string) => id.includes(hId)),
    );

    // TODO does this work for 5 and 6 level deep? guessing no
    // early return on those sets and catch the further ones in the next iteration
    if (!_.isEmpty(descendantsOfChildren)) {
      newIdList.push(
        hat.ipId,
        ...(_.flatten(descendantsOfChildren) as unknown as string[]),
      );
      return;
    }

    newIdList.push(...hatAndChildren);
  });

  // map to sorted array from above
  const sortedTree = _.map(newIdList, (id: string) =>
    _.find(simplifiedTree, (h: AppHat) => h.id === id),
  );

  const treeWithDepth = _.map(_.compact(sortedTree), (hat: AppHat) => ({
    ...hat,
    name: _.get(hat, 'detailsObject.data.name', hat.details),
    imageUrl: hat.imageUrl || '/icon.jpeg',
    depth: hat.id.split('.').length - 1,
  })) as unknown as HatWithDepth[];

  return treeWithDepth;
}
