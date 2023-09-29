import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
import { Hex } from 'viem';

import { extendControllers, extendWearers } from '@/lib/contract';
import { Hat, HatDetails, HatWearer, Tree } from '@/types';

import { decimalId, idToPrettyId } from './hats';

const mapHat = (
  hat: Hat | undefined,
  chainId: number,
  wAndCInfo: HatWearer[] | undefined,
): Hat | undefined => {
  if (!hat) return undefined;

  return {
    ...hat,
    chainId,
    name: hatIdDecimalToIp(BigInt(hat.id)),
    parentId: hat.admin?.id === hat.id ? undefined : hat.admin?.id,
    treeId: hat.tree?.id,
    isLinked: false,
    url: `/trees/${chainId}/${decimalId(hat.tree?.id)}`,
    extendedWearers: extendWearers(hat.wearers, wAndCInfo),
    extendedEligibility: extendControllers(hat.eligibility, wAndCInfo),
    extendedToggle: extendControllers(hat.toggle, wAndCInfo),
  };
};

// eslint-disable-next-line import/prefer-default-export
export async function toTreeStructure({
  treeData,
  hatsData,
  detailsData,
  wearersAndControllers,
  imagesData,
  draftHats,
  chainId,
  initialHatIds,
}: {
  treeData: Tree | null | undefined;
  hatsData: Hat[] | undefined;
  detailsData: {
    id: string;
    detailsObject: { type: string; data: HatDetails };
  }[];
  wearersAndControllers: HatWearer[] | undefined;
  imagesData: Hat[] | undefined;
  draftHats: Hat[] | undefined;
  chainId: number;
  initialHatIds: Hex[];
}): Promise<Hat[] | undefined> {
  if (
    !treeData ||
    !hatsData ||
    !detailsData ||
    !wearersAndControllers ||
    !imagesData
  ) {
    return Promise.resolve(undefined);
  }
  const onlyOnchainHats = _.filter(hatsData, (hat) =>
    _.includes(initialHatIds, hat?.id),
  );

  const mergedHatsData = _.map(onlyOnchainHats, (hat) => {
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

  const hats = _.map(initialHatIds, (hat) =>
    mapHat(_.find(mergedHatsData, ['id', hat]), chainId, wearersAndControllers),
  );

  const hatsList = _.orderBy(
    _.compact(_.concat(hats, draftHats)),
    (h) => {
      return _.size(_.split(h.name, '.'));
    },
    'asc',
  );
  const updatedHatsList = hatsList.map((hat) =>
    updateHatProperties(hat, treeData.parentOfTrees, treeData.linkedToHat),
  );

  return Promise.resolve(updatedHatsList);
}

const isHatInParentOfTrees = (
  hat: Hat,
  parentOfTrees: Tree[] | undefined,
): boolean => {
  return !!_.find(parentOfTrees, { id: idToPrettyId(hat.id) });
};

const isLinkedToHatFunc = (hat: Hat, linkedToHat: Hat | null): boolean => {
  return hat.id === linkedToHat?.id;
};

const updateHatProperties = (
  hat: Hat,
  parentOfTrees: Tree[] | undefined,
  linkedToHat: Hat | null,
): Hat => {
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
