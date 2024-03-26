import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { useMemo } from 'react';
import { AppHat, HatWearer, SupportedChains } from 'types';
import { fetchContractData, fetchHatWearerDetails } from 'utils';
import { Hex } from 'viem';

const batchFetchContractData = async (
  addresses: Hex[],
  chainId: SupportedChains,
) => {
  const promises = addresses.map((address) =>
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
  editMode,
}: {
  hat: AppHat;
  chainId: SupportedChains;
  editMode?: boolean;
}) => {
  const {
    data: hatWearers,
    isLoading,
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
    enabled: !_.isEmpty(contractWearersList) && !!chainId,
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
    isLoading: isLoading || contractWearersLoading,
    error,
    contractWearersError,
  };
};

export default useHatWearers;
