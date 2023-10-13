import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { useState } from 'react';

import { fetchPaginatedWearersForHat } from '@/gql/helpers';
import { HatWearer } from '@/types';

const useHatPaginatedWearers = ({
  hatId,
  chainId,
  initialPage = 0,
}: useHatPaginatedWearersProps) => {
  const [page, setPage] = useState(initialPage);

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
    data,
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
