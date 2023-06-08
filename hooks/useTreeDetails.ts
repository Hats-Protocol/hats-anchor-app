import { useQuery } from '@tanstack/react-query';

import { fetchTreeDetails } from '@/gql/helpers';
import { prettyIdToId } from '@/lib/hats';

const useTreeDetails = ({
  treeId,
  chainId,
  initialData,
}: UseTreeDetailsProps) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['treeDetails', treeId, chainId],
    queryFn: () => fetchTreeDetails(treeId, chainId),
    enabled: !!treeId,
    initialData,
  });

  const { linkedToHat, parentOfTrees } = data || {};
  const linkedHatIds = [];
  if (linkedToHat) {
    linkedHatIds.push(linkedToHat.id);
  }
  if (parentOfTrees) {
    linkedHatIds.push(
      ...parentOfTrees.map((tree: any) => prettyIdToId(tree.id)),
    );
  }

  return { data, linkedHatIds, isLoading, error };
};

export default useTreeDetails;

interface UseTreeDetailsProps {
  treeId: string;
  chainId: number;
  initialData?: any;
}
