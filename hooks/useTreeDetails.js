import { useQuery } from '@tanstack/react-query';
import { fetchTreeDetails } from '../gql/helpers';

const useTreeDetails = ({ treeId, chainId, hatId, initialData }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['treeDetails', treeId, hatId, chainId],
    queryFn: () => fetchTreeDetails(treeId, chainId),
    enabled: !!treeId,
    initialData,
  });

  const { childOfTree, linkedToHat, parentOfTrees } = data || {};
  const linkedHatIds = [];
  if (linkedToHat) {
    linkedHatIds.push(linkedToHat.prettyId);
  }
  if (parentOfTrees) {
    linkedHatIds.push(...parentOfTrees.map((tree) => tree.id));
  }
  if (childOfTree) {
    linkedHatIds.push(childOfTree.id);
  }

  return { data, linkedHatIds, isLoading, error };
};

export default useTreeDetails;
