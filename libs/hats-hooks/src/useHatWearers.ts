import { useQuery } from '@tanstack/react-query';
import { filter, find, get, map, omit } from 'lodash';
import { useMemo } from 'react';
import { AppHat, HatWearer, SupportedChains } from 'types';
import { batchFetchContractData, fetchHatWearerDetails } from 'utils';

// DEPRECATED: FETCH WEARER DETAILS FROM MESH

const useHatWearers = ({
  hat,
  chainId,
  editMode = false,
}: {
  hat: AppHat | undefined;
  chainId: SupportedChains | undefined;
  editMode?: boolean;
}) => {
  const {
    data: hatWearers,
    isLoading: hatWearersLoading,
    error,
  } = useQuery({
    queryKey: ['hatWearers', omit(hat, ['events']), chainId],
    queryFn: () => fetchHatWearerDetails(hat, chainId),
    staleTime: editMode ? Infinity : 15 * 1000 * 60,
    enabled: !!hat?.id && !!chainId,
  });

  const contractWearersList = useMemo(() => {
    if (!hatWearers) return [];
    return map(filter(hatWearers, { isContract: true }), 'id');
  }, [hatWearers]);

  const {
    data: contractWearers,
    isLoading: contractWearersLoading,
    error: contractWearersError,
  } = useQuery({
    queryKey: ['contractWearers', contractWearersList, chainId],
    queryFn: () => batchFetchContractData(contractWearersList, chainId),
    staleTime: editMode ? Infinity : 15 * 1000 * 60,
    enabled: !hatWearersLoading && !!chainId,
  });

  const combinedData = useMemo(() => {
    if (!hatWearers || !contractWearers) return null;
    return map(hatWearers, (wearer: HatWearer) => {
      const contractWearer = find(contractWearers, { id: wearer.id });
      if (get(contractWearer, 'error')) return wearer;

      return { ...wearer, ...contractWearer };
    });
  }, [hatWearers, contractWearers]);

  return {
    data: combinedData,
    isLoading: hatWearersLoading || contractWearersLoading,
    error,
    contractWearersError,
  };
};

export default useHatWearers;
