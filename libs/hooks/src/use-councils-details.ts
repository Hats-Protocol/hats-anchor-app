import { useQueries } from '@tanstack/react-query';
import { map, toLower } from 'lodash';
import { ExtendedHSGV2 } from 'types';
import { getCouncilData } from 'utils';

type Council = {
  hsg: string;
  chainId: number;
};

export const useCouncilsDetails = (councils: Council[]) => {
  const results = useQueries({
    queries: map(councils, (council) => ({
      queryKey: ['councilDetails', { chainId: council.chainId, hsg: council.hsg }],
      queryFn: async () =>
        getCouncilData({ id: toLower(council.hsg), chainId: council.chainId }) as Promise<ExtendedHSGV2>,
      enabled: !!council.hsg && !!council.chainId,
      refetchOnMount: true,
      staleTime: 0,
    })),
  });

  return {
    data: results.map((result) => result.data as ExtendedHSGV2 | null),
    isLoading: results.some((result) => result.isLoading),
    isError: results.some((result) => result.isError),
    queries: results.map((result) => ({
      isLoading: result.isLoading,
      isError: result.isError,
      error: result.error,
      isFetching: result.isFetching,
    })),
  };
};
