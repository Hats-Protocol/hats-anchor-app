import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { useState } from 'react';
import { Hex } from 'viem';

import { DetailsData } from '@/lib/details';
import { sha256 } from '@/lib/sha256';
import { toTreeStructure } from '@/lib/tree';
import { Hat, HatWearer, Tree } from '@/types';

import useDeepCompareEffect from './useDeepCompareEffect';

// app-hooks
const useOrgChartTree = ({
  treeData,
  hatsData,
  detailsData,
  wearersAndControllers,
  imagesData,
  draftHats,
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
      _.map(_.reject(detailsData, ['events', 'admin']), (d: any) =>
        sha256(JSON.stringify(d)),
      ),
    );
  }, [detailsData]);

  useDeepCompareEffect(() => {
    setHatsHashes(
      _.map(_.reject(hatsData, ['events', 'admin']), (d: any) =>
        sha256(JSON.stringify(d)),
      ),
    );
  }, [hatsData]);

  const fetchTree = async () => {
    if (
      !chainId ||
      !hatsData ||
      !detailsData ||
      !wearersAndControllers ||
      !imagesData
    ) {
      return undefined;
    }

    const tree = await toTreeStructure({
      treeData,
      hatsData,
      detailsData,
      wearersAndControllers,
      imagesData,
      draftHats,
      chainId,
      initialHatIds,
    });

    return tree;
  };

  const { data: orgChartTree, isLoading } = useQuery({
    queryKey: [
      'orgChartTree',
      { chainId, treeId: treeData?.id },
      hatsHashes,
      detailsHashes,
      _.map(imagesData, (h: Hat) => _.pick(h, ['id', 'details', 'imageUri'])),
      _.map(draftHats, (h: Hat) => _.pick(h, ['id', 'details', 'imageUri'])),
      { onchain },
    ],
    queryFn: fetchTree,
    enabled:
      !!treeData?.id &&
      !!chainId &&
      !!hatsData &&
      !!detailsData &&
      !!wearersAndControllers &&
      !!imagesData &&
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
  hatsData: Hat[] | undefined;
  detailsData: { id: string; detailsObject: DetailsData }[] | undefined;
  wearersAndControllers: HatWearer[] | undefined;
  imagesData: Hat[] | undefined;
  draftHats: Hat[] | undefined;
  imagesLoaded: boolean;
  detailsLoaded: boolean;
  initialHatIds: Hex[];
  chainId: number;
  editMode: boolean;
  onchain?: boolean;
}
