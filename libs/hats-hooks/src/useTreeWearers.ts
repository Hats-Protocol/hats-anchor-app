'use client';

import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { AppHat, SupportedChains } from 'types';
import { fetchTreeWearersDetails } from 'utils';

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
    queryKey: ['treeWearers', _.map(hats, 'id'), chainId],
    queryFn: () => fetchTreeWearersDetails(hats, chainId),
    staleTime: editMode ? Infinity : 15 * 1000 * 60,
    enabled: !_.isEmpty(hats) && !!chainId,
  });

  return { data, isLoading, error };
};

export default useTreeWearers;
