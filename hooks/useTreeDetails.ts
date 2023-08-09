import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';

import { fetchTreeDetails } from '@/gql/helpers';
import { toTreeId } from '@/lib/hats';
import { ITree } from '@/types';

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
  // TODO did this break any parent trees?
  // console.log(_.map(parentOfTrees, (tree: ITree) => toTreeId(tree.id)));
  if (parentOfTrees) {
    linkedHatIds.concat(
      _.map(parentOfTrees, (tree: ITree) => toTreeId(tree.id)),
    );
  }

  return { data, linkedHatIds, isLoading, error };
};

export default useTreeDetails;

interface UseTreeDetailsProps {
  treeId: string;
  chainId: number;
  initialData?: ITree | null;
}
