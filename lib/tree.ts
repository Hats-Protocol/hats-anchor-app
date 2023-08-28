import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
import { Hex } from 'viem';

import { FALLBACK_ADDRESS, ZERO_ADDRESS } from '@/constants';
import { fetchManyWearerDetails } from '@/gql/helpers';
import { fetchMultipleHatsDetails } from '@/hooks/useHatDetailsField';
import { extendControllers, extendWearers } from '@/lib/contract';
import { IHat, IHatWearer, ITree } from '@/types';

import { decimalId } from './hats';

const mapHat = (
  hat: IHat | undefined,
  chainId: number,
  wAndCInfo: IHatWearer[] | undefined,
): IHat | undefined => {
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

const mapLinkedHat = (
  hat: IHat | undefined,
  chainId: number,
  wAndCInfo: IHatWearer[] | undefined,
): IHat | undefined => {
  if (!hat) return undefined;

  return {
    ...hat,
    chainId,
    name: hatIdDecimalToIp(BigInt(hat.id)),
    parentId: undefined,
    treeId: hat.tree?.id,
    isLinked: true,
    url: `/trees/${chainId}/${decimalId(hat.tree?.id)}`,
    extendedWearers: extendWearers(hat.wearers, wAndCInfo),
    extendedEligibility: extendControllers(hat.eligibility, wAndCInfo),
    extendedToggle: extendControllers(hat.toggle, wAndCInfo),
  };
};

const mapParentTrees = (
  tree: ITree | undefined,
  chainId: number,
  hatsData: IHat[],
  wAndCInfo: IHatWearer[] | undefined,
): IHat | undefined => {
  if (!tree?.linkedToHat) return undefined;
  const {
    linkedToHat: { id },
    id: treeId,
  } = tree;

  if (!id) return undefined;
  const currentHat = _.find(hatsData, { id });
  if (!currentHat) return undefined;

  return {
    ...currentHat,
    id: treeId,
    chainId,
    name: hatIdDecimalToIp(BigInt(treeId)),
    parentId: id,
    treeId,
    isLinked: true,
    url: `/trees/${chainId}/${decimalId(treeId)}`,
    extendedWearers: extendWearers(currentHat.wearers, wAndCInfo),
    extendedEligibility: extendControllers(currentHat.eligibility, wAndCInfo),
    extendedToggle: extendControllers(currentHat.toggle, wAndCInfo),
  };
};

// eslint-disable-next-line import/prefer-default-export
export async function toTreeStructure({
  treeData,
  hatsImages,
  chainId,
  initialHatIds,
}: {
  treeData: ITree | null | undefined;
  hatsImages: IHat[] | undefined;
  chainId: number;
  initialHatIds: Hex[];
}): Promise<IHat[] | undefined> {
  if (!treeData || !hatsImages) return Promise.resolve(undefined);

  const detailsFields = _.map(hatsImages, 'details');
  const wAndCs = _.uniq(
    _.compact(
      _.reject(
        _.concat(
          _.map(_.flatten(_.map(hatsImages, 'wearers')), 'id'),
          _.map(_.flatten(_.map(hatsImages, 'toggle')), 'id'),
          _.map(_.flatten(_.map(hatsImages, 'eligibility')), 'id'),
        ),
        ZERO_ADDRESS || FALLBACK_ADDRESS,
      ),
    ),
  );
  const [details, wAndCInfo] = await Promise.all([
    fetchMultipleHatsDetails(detailsFields),
    fetchManyWearerDetails(wAndCs, chainId),
  ]);
  const hatsData = _.map(hatsImages, (hat: IHat, index: number) => ({
    ...hat,
    detailsObject: details?.[index],
  }));

  const hats = _.map(initialHatIds, (hat) =>
    mapHat(_.find(hatsData, ['id', hat]), chainId, wAndCInfo),
  );
  // If the tree is linkedToHat, add it to the hatsArray with the childOfTree id as its parent
  const linkedHats = _.map([treeData?.linkedToHat || undefined], (hat) =>
    mapLinkedHat(hat, chainId, wAndCInfo),
  );
  // If the tree has parentOfTrees, add them to the hatsArray with the linkedToHat as their parent
  const parentOfTrees = _.map(treeData?.parentOfTrees, (tree) =>
    mapParentTrees(tree, chainId, hatsData, wAndCInfo),
  );
  // If the user has draft hats that are not in the tree, add them to the hatsArray
  const draftHats = _.filter(hatsImages, (hat) =>
    _.includes(_.difference(_.map(hatsImages, 'id'), initialHatIds), hat.id),
  );

  const hatsList = _.orderBy(
    _.compact(_.concat(hats, linkedHats, parentOfTrees, draftHats)),
    (h) => {
      return _.size(_.split(h.name, '.'));
    },
    'asc',
  );

  return Promise.resolve(hatsList);
}
