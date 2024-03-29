import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { useMemo } from 'react';
import { AppHat, HatWearer, SupportedChains } from 'types';
import { fetchContractData, fetchHatWearerDetails } from 'utils';
import { Hex } from 'viem';

const batchFetchContractData = async (
  addresses: Hex[],
  chainId: SupportedChains | undefined,
) => {
  const promises = _.map(addresses, (address: Hex) =>
    fetchContractData(chainId, address),
  );
  const data = await Promise.all(promises);

  return _.map(addresses, (address: Hex, index: number) => ({
    id: address,
    ...data[index],
  }));
};

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
    queryKey: ['hatWearers', _.omit(hat, ['events']), chainId],
    queryFn: () => fetchHatWearerDetails(hat, chainId),
    staleTime: editMode ? Infinity : 15 * 1000 * 60,
    enabled: !!hat?.id && !!chainId,
  });

  const contractWearersList = useMemo(() => {
    if (!hatWearers) return [];
    return _.map(_.filter(hatWearers, { isContract: true }), 'id');
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
    return _.map(hatWearers, (wearer: HatWearer) => {
      const contractWearer = _.find(contractWearers, { id: wearer.id });
      if (_.get(contractWearer, 'error')) return wearer;

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
