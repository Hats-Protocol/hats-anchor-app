import { useQuery } from '@tanstack/react-query';
import { fetchTreeDetails } from '../gql/helpers';
import { prettyIdToId } from '../lib/hats';

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
    linkedHatIds.push(...parentOfTrees.map((tree) => prettyIdToId(tree.id)));
  }
  if (childOfTree && childOfTree.id !== linkedToHat?.prettyId) {
    linkedHatIds.push(childOfTree.id);
  }

  return { data, linkedHatIds, isLoading, error };
};

export default useTreeDetails;
