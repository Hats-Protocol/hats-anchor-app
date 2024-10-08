import { useQuery } from '@tanstack/react-query';
import { isEmpty, map } from 'lodash';
import { AppHat, SupportedChains } from 'types';
import { fetchTreeWearersDetails } from 'utils';

// can be deprecated with fetching controller data from mesh

const useTreeWearers = ({
  hats,
  chainId,
  editMode = false,
}: {
  hats: AppHat[] | undefined;
  chainId: SupportedChains | undefined;
  editMode?: boolean;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['treeWearers', map(hats, 'id'), chainId],
    queryFn: () => fetchTreeWearersDetails(hats, chainId),
    staleTime: editMode ? Infinity : 15 * 1000 * 60,
    enabled: !isEmpty(hats) && !!chainId,
  });

  return { data, isLoading, error };
};

export default useTreeWearers;
