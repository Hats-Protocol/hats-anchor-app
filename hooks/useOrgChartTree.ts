import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { Hex } from 'viem';

import { toTreeStructure } from '@/lib/tree';
import { IHat, ITree } from '@/types';

const useOrgChartTree = ({
  treeData,
  chainId,
  hatsWithImageData,
  initialHatIds,
}: UseOrgChartTreeProps) => {
  const fetchTree = async () => {
    if (!treeData || !chainId || !hatsWithImageData) return undefined;

    console.log('build tree');
    const tree = await toTreeStructure({
      treeData,
      hatsImages: hatsWithImageData,
      chainId,
      initialHatIds,
    });
    console.log(tree);

    return tree;
  };

  const { data: orgChartTree, isLoading } = useQuery({
    queryKey: [
      'orgChartTree',
      treeData?.id,
      chainId,
      _.map(hatsWithImageData, 'id'),
    ],
    queryFn: fetchTree,
    enabled: !!treeData?.id && !!chainId && !!hatsWithImageData,
  });

  return { orgChartTree, isLoading };
};

export default useOrgChartTree;

interface UseOrgChartTreeProps {
  treeData: ITree | null | undefined;
  chainId: number;
  hatsWithImageData: IHat[] | undefined;
  initialHatIds: Hex[];
}
