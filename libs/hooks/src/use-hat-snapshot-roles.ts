import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { SnapshotSpace, SupportedChains } from 'types';
import { processSnapshotSpacesForHat } from 'utils';

const useHatSnapshotRoles = ({
  spaces,
  hatId,
  chainId,
  editMode = false,
}: {
  spaces?: SnapshotSpace[];
  hatId?: string;
  chainId?: SupportedChains;
  editMode?: boolean;
}) => {
  const { data, error, isLoading, fetchStatus } = useQuery({
    queryKey: ['hatSnapshotRoles', _.map(spaces, 'id'), hatId, chainId],
    queryFn: () => processSnapshotSpacesForHat({ chainId, spaces, hatId }),
    enabled: !!spaces && !_.isEmpty(spaces) && !!hatId && !!chainId,
    staleTime: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
  });

  return { data, error, isLoading: isLoading && fetchStatus !== 'idle' };
};

export { useHatSnapshotRoles };
