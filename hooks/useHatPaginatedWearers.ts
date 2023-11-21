import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useAccount } from 'wagmi';

import { useTreeForm } from '@/contexts/TreeFormContext';
import { fetchPaginatedWearersForHat } from '@/gql/helpers';
import { sortWearers } from '@/lib/wearers';
import { HatWearer } from '@/types';

// hats-hooks
const useHatPaginatedWearers = ({
  hatId,
  initialPage = 0,
}: useHatPaginatedWearersProps) => {
  const [page, setPage] = useState(initialPage);
  const { chainId } = useTreeForm();
  const { address } = useAccount();

  const { data, isLoading, isFetching, isPreviousData } = useQuery({
    queryKey: ['wearersList', hatId, chainId, page],
    queryFn: () => {
      if (!hatId || !chainId) return [];
      return fetchPaginatedWearersForHat(hatId, chainId, page);
    },
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
  chainId?: number;
  perPage?: number;
  initialPage?: number;
  initialData?: HatWearer[];
}
