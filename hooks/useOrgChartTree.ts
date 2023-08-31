import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { Hex } from 'viem';

import { toTreeStructure } from '@/lib/tree';
import { HatDetails, IHat, IHatWearer, ITree } from '@/types';

const useOrgChartTree = ({
  treeData,
  hatsData,
  detailsData,
  wearersAndControllers,
  imagesData,
  imagesLoaded,
  initialHatIds,
  chainId,
}: UseOrgChartTreeProps) => {
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
      chainId,
      initialHatIds,
    });

    return tree;
  };

  const { data: orgChartTree, isLoading } = useQuery({
    queryKey: [
      'orgChartTree',
      { chainId, treeId: treeData?.id },
      _.map(hatsData, 'id'),
    ],
    queryFn: fetchTree,
    enabled:
      !!treeData?.id &&
      !!chainId &&
      !!hatsData &&
      !!detailsData &&
      !!wearersAndControllers &&
      !!imagesData &&
      imagesLoaded,
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
  imagesLoaded: boolean;
  initialHatIds: Hex[];
  chainId: number;
}
