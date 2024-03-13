import { useQuery } from '@tanstack/react-query';
import { HatWearer, SupportedChains } from 'types';
import { sortWearers } from 'hats-utils';
import { useState } from 'react';
import { fetchPaginatedWearersForHat } from 'utils';
import { useAccount } from 'wagmi';

const useHatPaginatedWearers = ({
  hatId,
  chainId,
  initialPage = 0,
  editMode = false,
}: useHatPaginatedWearersProps) => {
  const [page, setPage] = useState(initialPage);
  const { address } = useAccount();

  const { data, isLoading, isFetching, isPreviousData } = useQuery({
    queryKey: ['wearersList', hatId, chainId, page],
    queryFn: () => {
      if (!hatId || !chainId) return [];
      return fetchPaginatedWearersForHat(hatId, chainId, page);
    },
    staleTime: editMode ? Infinity : 1_000 * 60 * 15,
  });

  const nextPage = () => {
    if (!isPreviousData) {
      setPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    setPage((prev) => Math.max(prev - 1, 0));
  };

  return {
    paginatedWearers: sortWearers({
      wearers: data,
      address,
    }),
    isLoading,
    isFetching,
    nextPage,
    prevPage,
    currentPage: page,
  };
};

export default useHatPaginatedWearers;

interface useHatPaginatedWearersProps {
  hatId?: string;
  chainId?: SupportedChains;
  perPage?: number;
  initialPage?: number;
  initialData?: HatWearer[];
  editMode?: boolean;
}
