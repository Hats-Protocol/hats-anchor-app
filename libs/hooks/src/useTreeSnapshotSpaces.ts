import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { AppHat, SupportedChains } from 'types';
import { fetchSnapshotSpaces } from 'utils';

const getSpaces = (orgChartTree: AppHat[] | null | undefined) => {
  return _.compact(_.map(orgChartTree, 'snapshot'));
};

const useTreeSnapshotSpaces = ({
  orgChartTree,
  chainId,
  editMode = false,
}: {
  orgChartTree: AppHat[] | null | undefined;
  chainId: SupportedChains | undefined;
  editMode: boolean;
}) => {
  const spaces = getSpaces(orgChartTree);

  const { data, error, isLoading } = useQuery({
    queryKey: ['treeSnapshotSpaces', spaces, chainId],
    queryFn: () => fetchSnapshotSpaces(chainId, spaces),
    enabled: spaces && !_.isEmpty(spaces) && !!chainId,
    staleTime: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
  });

  return { data, error, isLoading };
};

export default useTreeSnapshotSpaces;
