import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';

import { toTreeStructure } from '@/lib/hats';
import { IHat, ITree } from '@/types';

const useOrgChartTree = ({
  treeData,
  chainId,
  hatsWithImageData,
}: UseOrgChartTreeProps) => {
  const fetchTree = async () => {
    if (!treeData || !chainId || !hatsWithImageData) return undefined;

    const tree = await toTreeStructure({
      treeData,
      hatsImages: hatsWithImageData,
      chainId,
    });

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
}
