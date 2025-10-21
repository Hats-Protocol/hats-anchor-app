import { Tree } from '@hatsprotocol/sdk-v1-subgraph';
import { useQuery } from '@tanstack/react-query';
import { toTreeStructure } from 'hats-utils';
import { concat, find, get, map, pick, reject } from 'lodash';
import { useState } from 'react';
import { AppHat, HatWearer, SupportedChains } from 'types';
import { Hex } from 'viem';

import { useDeepCompareEffect } from './use-deep-compare-effect';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore next-line
import { sha256 } from './utils/sha256.js';

const useOrgChartTree = ({
  treeData,
  hatsData,
  draftHats,
  orgChartWearers,
  initialHatIds,
  chainId,
  editMode,
  onchain = false,
}: UseOrgChartTreeProps) => {
  const [hatsHashes, setHatsHashes] = useState<unknown[]>();

  const localHatsData = map(hatsData, (hat) => {
    const detailsMetadata = get(hat, 'detailsMetadata');

    // If no detailsMetadata, try to create one from plain text details field
    if (!detailsMetadata || detailsMetadata === null) {
      const plainDetails = get(hat, 'details');
      if (plainDetails && !plainDetails.startsWith('ipfs://')) {
        return {
          ...hat,
          detailsObject: {
            type: 'text',
            data: { name: plainDetails },
          },
        };
      }
      return hat;
    }

    return {
      ...hat,
      detailsObject: JSON.parse(detailsMetadata as string),
    };
  });

  useDeepCompareEffect(() => {
    setHatsHashes(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map(reject(localHatsData, ['events', 'admin']), (d: any) => sha256(JSON.stringify(d))),
    );
  }, [hatsData]);

  const fetchTree = async () => {
    if (!chainId || !hatsData || !orgChartWearers) {
      return null;
    }

    const tree = await toTreeStructure({
      treeData,
      hatsData,
      draftHats,
      orgChartWearers,
      chainId,
      initialHatIds,
    });

    const topHat: AppHat | undefined = find(
      tree,
      (hat: AppHat) => hat.treeId === treeData?.id && hat.levelAtLocalTree === 0,
    );
    const topHatIsLinked = get(topHat, 'admin.id') !== get(topHat, 'id');

    if (editMode && topHatIsLinked) {
      // remove linked hats from tree
      // mask top hat that is linked to itself

      if (!topHat) return tree;
      // TODO does this break draft hats? adding treeId to draft hats maybe helps?
      const filteredTree = reject(tree, (hat: AppHat) => hat.treeId !== treeData?.id || hat.id === topHat?.id);
      const patchTopHat = {
        ...(topHat as AppHat),
        // admin: { id: topHat.id }, // actually need to override parentId for OrgChart
        parentId: undefined, // set to undefined for root node in d3-org-chart
      };
      const patchedTree = concat(filteredTree, [patchTopHat]);
      return patchedTree;
    }

    return tree;
  };

  const { data: orgChartTree, isLoading } = useQuery({
    queryKey: [
      'orgChartTree',
      { chainId, treeId: treeData?.id },
      hatsHashes,
      map(draftHats, (h: AppHat) => pick(h, ['id', 'details', 'imageUri'])),
      { onchain, editMode },
    ],
    queryFn: fetchTree,
    enabled: !!treeData?.id && !!chainId && !!hatsData && !!orgChartWearers,
    refetchInterval: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
  });

  return { orgChartTree, isLoading };
};

interface UseOrgChartTreeProps {
  treeData: Tree | null | undefined;
  hatsData: AppHat[] | undefined;
  draftHats: AppHat[] | undefined;
  orgChartWearers?: HatWearer[] | undefined;
  initialHatIds: Hex[];
  chainId: SupportedChains;
  editMode: boolean;
  onchain?: boolean;
}

export { useOrgChartTree };
