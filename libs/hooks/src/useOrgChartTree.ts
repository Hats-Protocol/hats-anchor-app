'use client';

/* eslint-disable import/extensions */
import { Tree } from '@hatsprotocol/sdk-v1-subgraph';
import { useQuery } from '@tanstack/react-query';
import { DetailsData, toTreeStructure } from 'hats-utils';
import { concat, find, map, pick, reject } from 'lodash';
import { useState } from 'react';
import { AppHat, HatWearer, SupportedChains } from 'types';
import { Hex } from 'viem';

import useDeepCompareEffect from './useDeepCompareEffect';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore next-line
import { sha256 } from './utils/sha256.js';

// hooks
const useOrgChartTree = ({
  treeData,
  hatsData,
  detailsData,
  imagesData,
  draftHats,
  orgChartWearers,
  imagesLoaded,
  detailsLoaded,
  initialHatIds,
  chainId,
  editMode,
  onchain = false,
}: UseOrgChartTreeProps) => {
  const [detailsHashes, setDetailsHashes] = useState<unknown[]>();
  const [hatsHashes, setHatsHashes] = useState<unknown[]>();

  useDeepCompareEffect(() => {
    setDetailsHashes(
      map(reject(detailsData, ['events', 'admin']), (d: any) =>
        sha256(JSON.stringify(d)),
      ),
    );
  }, [detailsData]);

  useDeepCompareEffect(() => {
    setHatsHashes(
      map(reject(hatsData, ['events', 'admin']), (d: any) =>
        sha256(JSON.stringify(d)),
      ),
    );
  }, [hatsData]);

  const fetchTree = async () => {
    if (
      !chainId ||
      !hatsData ||
      !detailsData ||
      !imagesData ||
      !orgChartWearers
    ) {
      return null;
    }

    const tree = await toTreeStructure({
      treeData,
      hatsData,
      detailsData,
      imagesData,
      draftHats,
      orgChartWearers,
      chainId,
      initialHatIds,
    });

    if (editMode) {
      // remove linked hats from tree
      // mask top hat that is linked to itself

      const topHat: AppHat | undefined = find(tree,
        (hat: AppHat) => hat.treeId === treeData?.id && hat.levelAtLocalTree === 0
      );
      if (!topHat) return tree;
      const filteredTree = reject(tree,
        (hat: AppHat) => hat.treeId !== treeData?.id || hat.id === topHat?.id
      );
      const patchTopHat = {
        ...topHat as AppHat,
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
      detailsHashes,
      map(imagesData, (h: AppHat) => pick(h, ['id', 'details', 'imageUri'])),
      map(draftHats, (h: AppHat) => pick(h, ['id', 'details', 'imageUri'])),
      { onchain, editMode },
    ],
    queryFn: fetchTree,
    enabled:
      !!treeData?.id &&
      !!chainId &&
      !!hatsData &&
      !!detailsData &&
      !!imagesData &&
      !!orgChartWearers &&
      imagesLoaded &&
      detailsLoaded,
    refetchInterval: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
    // refetchOnWindowFocus: process.env.NODE_ENV !== 'development',
  });

  return { orgChartTree, isLoading };
};

export default useOrgChartTree;

interface UseOrgChartTreeProps {
  treeData: Tree | null | undefined;
  hatsData: AppHat[] | undefined;
  detailsData: { id: string; detailsObject: DetailsData }[] | undefined;
  imagesData: AppHat[] | undefined;
  draftHats: AppHat[] | undefined;
  orgChartWearers?: HatWearer[] | undefined;
  imagesLoaded: boolean;
  detailsLoaded: boolean;
  initialHatIds: Hex[];
  chainId: SupportedChains;
  editMode: boolean;
  onchain?: boolean;
}
