import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { useState } from 'react';
import { Hex } from 'viem';

import { sha256 } from '@/lib/sha256';
import { toTreeStructure } from '@/lib/tree';
import { HatDetails, IHat, IHatWearer, ITree } from '@/types';

import useDeepCompareEffect from './useDeepCompareEffect';

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
}: UseOrgChartTreeProps) => {
  const [detailsHashes, setDetailsHashes] = useState<unknown[]>();
  const [hatsHashes, setHatsHashes] = useState<unknown[]>();

  useDeepCompareEffect(() => {
    setDetailsHashes(
      _.map(_.reject(detailsData, ['events', 'admin']), (d) =>
        sha256(JSON.stringify(d)),
      ),
    );
  }, [detailsData]);

  useDeepCompareEffect(() => {
    setHatsHashes(
      _.map(_.reject(hatsData, ['events', 'admin']), (d) =>
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
      _.map(imagesData, (h) => _.pick(h, ['id', 'details', 'imageUri'])),
      _.map(draftHats, (h) => _.pick(h, ['id', 'details', 'imageUri'])),
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
    refetchOnWindowFocus: true,
  });

  return { orgChartTree, isLoading };
};

export default useOrgChartTree;

interface UseOrgChartTreeProps {
  treeData: ITree | null | undefined;
  hatsData: IHat[] | undefined;
  detailsData:
    | { id: string; detailsObject: { type: string; data: HatDetails } }[]
    | undefined;
  wearersAndControllers: IHatWearer[] | undefined;
  imagesData: IHat[] | undefined;
  draftHats: IHat[] | undefined;
  imagesLoaded: boolean;
  detailsLoaded: boolean;
  initialHatIds: Hex[];
  chainId: number;
}
