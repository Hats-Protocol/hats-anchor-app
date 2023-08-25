import { useQuery } from '@tanstack/react-query';

import { toTreeStructure } from '@/lib/hats';
import { IHat } from '@/types';

const useOrgChartTree = ({
  treeData,
  chainId,
  hatsWithImageData,
}: UseOrgChartTreeProps) => {
  const id = treeData?.id;
  const fetchTree = async () => {
    console.log('running tree build');
    const tree = await toTreeStructure({
      treeData,
      hatsImages: hatsWithImageData,
      chainId,
    });
    return tree;
  };

  const { data, isLoading } = useQuery({
    queryKey: ['orgChartTree', id, chainId],
    queryFn: fetchTree,
    enabled: !!treeData && !!chainId && !!hatsWithImageData,
  });

  return { data, isLoading };
};

export default useOrgChartTree;

interface UseOrgChartTreeProps {
  treeData: any;
  chainId: number;
  hatsWithImageData: IHat[] | undefined;
}
