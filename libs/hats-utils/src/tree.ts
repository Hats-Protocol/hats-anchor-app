import { hatIdDecimalToIp, treeIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { Tree } from '@hatsprotocol/sdk-v1-subgraph';
import {
  compact,
  concat,
  each,
  filter,
  find,
  first,
  flatten,
  get,
  gt,
  includes,
  isEmpty,
  map,
  orderBy,
  pick,
  size,
  split,
  toNumber,
} from 'lodash';
import { AppHat, HatWearer, HatWithDepth, SupportedChains } from 'types';
import { formatAddress, formatScientificWhole, ipfsUrl } from 'utils';
import { Hex } from 'viem';

import { getTreeId } from './hats';

type OrgChartTypes =
  | 'contract' // has bytecode and we get name back from etherscan
  | 'wearer' // has a single wearer that appears to not be
  | 'many' // has many wearers that may or may not be contracts
  | 'noWearer' // has no wearers, but still has supply
  | 'group'; // has 0 supply

// TODO move these to app-utils
export const ORG_CHART_ICONS: Record<OrgChartTypes, string> = {
  contract: `<img src="/icons/contract.svg" alt="contract wearer" />`,
  wearer: `<img src="/icons/wearer.svg" alt="wearer" />`,
  many: `<img src="/icons/many.svg" alt="many" />`,
  noWearer: `<img src="/icons/no-wearers.svg" alt="no supply" style="height: 16px; margin-left: -2px;" />`,
  group: `<img src="/icons/no-wearers.svg" alt="no supply" style="height: 16px; margin-left: -2px;" />`, // `<img src="/icons/group.svg" alt="group" />`,
};

export const ORG_CHART_COLORS = {
  contract: '#B2F5EA', // teal.100
  wearer: '#FED7E2', // pink.100
  many: '#FFF5F7', // pink.50
  noWearers: '#EDF2F7', // gray.100
  group: '#F7FAFC', // gray.50
};

const handleOrgChartWearers = (hat: AppHat, orgChartWearers: HatWearer[] | undefined) => {
  const { wearers, maxSupply, currentSupply } = pick(hat, ['wearers', 'maxSupply', 'currentSupply']);
  const maxSupplyText = formatScientificWhole(toNumber(maxSupply) || 1);

  // INITIALIZE WITH NO WEARERS
  let bgColor = ORG_CHART_COLORS.noWearers;
  const wearer = first(wearers);
  const extendedWearer = find(orgChartWearers, { id: wearer?.id });
  let content = '0 Wearers';
  let accent = `of ${maxSupplyText}`;
  let icon = ORG_CHART_ICONS.noWearer;

  // HANDLE HATS WITH MANY WEARERS. GROUPS (0 SUPPLY) ARE HANDLED IN THE ORG CHART DIRECTLY
  if (toNumber(currentSupply) > 1) {
    bgColor = ORG_CHART_COLORS.many;
    content = `${currentSupply} Wearers`;
    accent = `of ${maxSupplyText}`;
    icon = ORG_CHART_ICONS.wearer; // ORG_CHART_ICONS.group;
  }

  // INDIVIDUAL WEARERS
  if (size(wearers) === 1) {
    content =
      !!extendedWearer?.ensName && extendedWearer?.ensName !== ''
        ? extendedWearer?.ensName
        : formatAddress(get(wearer, 'id'));
    accent = `1 of ${maxSupplyText}`;
    icon = ORG_CHART_ICONS.wearer;
    if (extendedWearer?.isContract) {
      bgColor = ORG_CHART_COLORS.contract;
      icon = ORG_CHART_ICONS.contract;
    } else {
      bgColor = ORG_CHART_COLORS.wearer;
    }
  }

  // handle wearers overflow with max supply accent
  let dims = { contentWidth: '135px', accentWidth: '35px' };
  if (gt(toNumber(maxSupply), 999)) {
    dims = { contentWidth: '115px', accentWidth: '62px' };
  } else if (gt(toNumber(maxSupply), 99)) {
    dims = { contentWidth: '115px', accentWidth: '55px' };
  } else if (gt(toNumber(maxSupply), 9)) {
    dims = { contentWidth: '130px', accentWidth: '38px' };
  }

  return { color: bgColor, accent, icon, content, ...dims };
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
    url: `/trees/${chainId}/${treeIdHexToDecimal(hat.tree?.id || hat.treeId || '0x')}`,
    hatChartWearers: handleOrgChartWearers(hat, orgChartWearers),
  };
};

// eslint-disable-next-line import/prefer-default-export
export async function toTreeStructure({
  treeData,
  hatsData,
  draftHats,
  orgChartWearers,
  chainId,
  initialHatIds,
}: {
  treeData: Tree | null | undefined;
  hatsData: AppHat[] | undefined;
  draftHats: AppHat[] | undefined;
  orgChartWearers: HatWearer[] | undefined;
  chainId: SupportedChains;
  initialHatIds: Hex[];
}): Promise<AppHat[] | undefined> {
  if (!treeData || !hatsData) {
    return Promise.resolve(undefined);
  }
  const onlyOnchainHats = filter(hatsData, (hat: AppHat) => includes(initialHatIds, hat?.id));

  const mergedHatsData = map(onlyOnchainHats, (hat: AppHat) => {
    const fullHat = find(hatsData, { id: hat.id });

    if (!fullHat) return undefined;

    return {
      ...fullHat,
      detailsObject: JSON.parse(fullHat?.detailsMetadata || '{}'),
      imageUrl: ipfsUrl(fullHat?.nearestImage),
      nearestImageUrl: fullHat?.nearestImage, // TODO migrate to nearestImageUrl to avoid confusion with existing usage of imageUrl and icon.jpeg fallbacks
    };
  });

  const hats = map(initialHatIds, (hat: Hex) => mapHat(find(mergedHatsData, ['id', hat]), orgChartWearers, chainId));

  // extra sort for the list view
  const hatsList = orderBy(compact(concat(hats, draftHats)), (h: AppHat) => size(split(h.name, '.')), 'asc');
  const updatedHatsList = hatsList.map((hat: AppHat) =>
    updateHatProperties(hat, treeData.parentOfTrees, (treeData.linkedToHat as AppHat) || null),
  );

  return Promise.resolve(updatedHatsList);
}

const isHatInParentOfTrees = (hat: AppHat, parentOfTrees: Tree[] | undefined): boolean => {
  return !!find(parentOfTrees, { id: getTreeId(hat.id) });
};

const isLinkedToHatFunc = (hat: AppHat, linkedToHat: AppHat | null): boolean => {
  return hat.id === linkedToHat?.id;
};

const updateHatProperties = (hat: AppHat, parentOfTrees: Tree[] | undefined, linkedToHat: AppHat | null): AppHat => {
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
  return filter(tree, (h: AppHat) => h.admin?.id === hat.id);
};

const checkChildrenForDescendants = (hat: AppHat, tree: AppHat[]): Hex[] => {
  const newArray = [hat.id];
  if (!isEmpty(getChildren(hat, tree))) {
    newArray.push(
      ...flatten(
        map(getChildren(hat, tree), (child: AppHat) => {
          if (!isEmpty(getChildren(child, tree))) {
            // TODO not working at 4+ levels, need recursive solution
            return flatten(concat([child.id], map(getChildren(child, tree), 'id')));
          }

          return [child.id];
        }),
      ),
    );
  }

  return flatten(newArray);
};

const compareHatIds = (a: AppHat, b: AppHat): number => {
  if (BigInt(a.id) < BigInt(b.id)) return -1;
  if (BigInt(a.id) > BigInt(b.id)) return 1;

  return 0;
};

export function prepareMobileTreeHats(tree: AppHat[] | undefined): HatWithDepth[] {
  if (!tree) return [];
  let newIdList: Hex[] = [];
  if (tree.length > 0) {
    // start with the top hat
    newIdList = compact([get(first(tree), 'id')]);
  }

  each(tree.slice(1), (hat: AppHat) => {
    if (includes(newIdList, hat.id)) return;
    const hats = checkChildrenForDescendants(hat, tree);
    newIdList = concat(newIdList, ...hats);
  });

  const sortedTree = tree.sort(compareHatIds);

  const treeWithDepth = map(compact(sortedTree), (hat: AppHat) => ({
    ...hat,
    name: get(hat, 'detailsObject.data.name', hat.details),
    imageUrl: hat.imageUrl || '/icon.jpeg',
    depth: hatIdDecimalToIp(BigInt(hat.id)).split('.').length - 1,
  })) as unknown as HatWithDepth[];

  return treeWithDepth;
}
