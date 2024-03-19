import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { Tree } from '@hatsprotocol/sdk-v1-subgraph';
import _ from 'lodash';
import {
  AppHat,
  HatDetails,
  HatWearer,
  HatWithDepth,
  SupportedChains,
} from 'types';
import { formatAddress } from 'utils';
import { Hex } from 'viem';

import { decimalId, getTreeId } from './hats';
import { maxSupplyText } from './wearers';

const ORG_CHART_ICONS = {
  contract: `<img src="/icons/contract.svg" alt="wearer" />`,
  wearer: `<img src="/icons/wearer.svg" alt="wearer" />`,
};

const ORG_CHART_COLORS = {
  contract: '#F0FFF4',
  wearer: '#FFFAF0',
  noWearers: '#FFFFFF',
  group: '#F0F0FF',
};

const handleOrgChartWearers = (
  hat: AppHat,
  orgChartWearers: HatWearer[] | undefined,
) => {
  const { wearers, maxSupply, currentSupply } = _.pick(hat, [
    'wearers',
    'maxSupply',
    'currentSupply',
  ]);

  // FALLBACK/INITIALIZE WITH NO WEARERS
  let color = ORG_CHART_COLORS.noWearers;
  const wearer = _.first(wearers);
  let content = 'No Wearers';
  let accent = `0 of ${maxSupplyText(maxSupply)}`;
  let icon = ORG_CHART_ICONS.wearer;

  // HANDLE GROUPS
  if (_.toNumber(currentSupply) > 1) {
    color = '#FFFFF0';
    content = `${currentSupply} Wearers`;
    accent = `out of ${maxSupplyText(maxSupply)}`;
  }

  // INDIVIDUAL WEARERS
  if (_.size(wearers) === 1) {
    const extendedWearer = _.find(orgChartWearers, {
      id: wearer?.id,
    });
    content =
      !!extendedWearer?.ensName && extendedWearer?.ensName !== ''
        ? extendedWearer?.ensName
        : formatAddress(_.get(wearer, 'id'));
    accent = `1 of ${maxSupplyText(maxSupply)}`;
    if (wearer?.isContract) {
      color = ORG_CHART_COLORS.contract;
      icon = ORG_CHART_ICONS.contract;
    } else {
      color = ORG_CHART_COLORS.wearer;
    }
  }

  // handle wearers overflow with max supply accent
  let dims = { contentWidth: '135px', accentWidth: '35px' };
  if (_.gt(_.toNumber(maxSupply), 999)) {
    dims = { contentWidth: '115px', accentWidth: '62px' };
  } else if (_.gt(_.toNumber(maxSupply), 99)) {
    dims = { contentWidth: '115px', accentWidth: '55px' };
  } else if (_.gt(_.toNumber(maxSupply), 9)) {
    dims = { contentWidth: '130px', accentWidth: '38px' };
  }

  return { color, accent, icon, content, ...dims };
};

const mapHat = (
  hat: AppHat | undefined,
  orgChartWearers: HatWearer[] | undefined,
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
    orgChartWearers: handleOrgChartWearers(hat, orgChartWearers),
  };
};

// eslint-disable-next-line import/prefer-default-export
export async function toTreeStructure({
  treeData,
  hatsData,
  detailsData,
  imagesData,
  draftHats,
  orgChartWearers,
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
  orgChartWearers: HatWearer[] | undefined;
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
    mapHat(_.find(mergedHatsData, ['id', hat]), orgChartWearers, chainId),
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

const getChildren = (hat: AppHat, tree: AppHat[]) => {
  return _.filter(tree, (h: AppHat) => h.admin?.id === hat.id);
};

const checkChildrenForDescendants = (hat: AppHat, tree: AppHat[]): Hex[] => {
  const newArray = [hat.id];
  if (!_.isEmpty(getChildren(hat, tree))) {
    newArray.push(
      ..._.flatten(
        _.map(getChildren(hat, tree), (child: AppHat) => {
          if (!_.isEmpty(getChildren(child, tree))) {
            // TODO not working at 4+ levels, need recursive solution
            return _.flatten(
              _.concat([child.id], _.map(getChildren(child, tree), 'id')),
            );
          }

          return [child.id];
        }),
      ),
    );
  }

  return _.flatten(newArray);
};

const compareHatIds = (a: AppHat, b: AppHat): number => {
  if (BigInt(decimalId(a.id)) < BigInt(decimalId(b.id))) {
    return -1;
  }
  if (BigInt(decimalId(a.id)) > BigInt(decimalId(b.id))) {
    return 1;
  }

  return 0;
};

export function prepareMobileTreeHats(tree: AppHat[]): HatWithDepth[] {
  // * tricky sort ahead, follow each branch to their conclusion
  // * before returning to next sibling at previous level
  let newIdList = tree
    ? // start with the top hat
      [_.get(_.first(tree), 'id')]
    : [];

  _.each(tree.slice(1), (hat: AppHat) => {
    if (_.includes(newIdList, hat.id)) return;
    const hats = checkChildrenForDescendants(hat, tree);
    newIdList = _.concat(newIdList, ...hats);
  });

  const sortedTree = tree.sort(compareHatIds);

  const treeWithDepth = _.map(_.compact(sortedTree), (hat: AppHat) => ({
    ...hat,
    name: _.get(hat, 'detailsObject.data.name', hat.details),
    imageUrl: hat.imageUrl || '/icon.jpeg',
    depth: hatIdDecimalToIp(BigInt(hat.id)).split('.').length - 1,
  })) as unknown as HatWithDepth[];

  return treeWithDepth;
}
