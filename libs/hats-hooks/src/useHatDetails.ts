'use client';

import { ZERO_ID } from '@hatsprotocol/constants';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { AppHat, SupportedChains } from 'types';
import { fetchHatDetailsMesh } from 'utils';

const useHatDetails = ({
  hatId,
  chainId,
  initialData,
  editMode,
}: {
  hatId: string | undefined;
  chainId: SupportedChains | undefined;
  initialData?: AppHat | null;
  editMode?: boolean;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['hatDetails', { id: hatId, chainId }],
    queryFn: () => fetchHatDetailsMesh(hatId, chainId),
    enabled:
      !!hatId &&
      hatId !== ZERO_ID &&
      hatId !== 'undefined' && // ? why is hatId getting set to undefined string?
      hatId !== '0x' &&
      !!chainId,
    staleTime: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
    initialData,
  });

  const metadata = _.get(data, 'detailsMetadata');
  const fullDetails = metadata ? JSON.parse(metadata) : {};
  const details = _.get(fullDetails, 'data');

  return { data, details, isLoading, error };
};

export default useHatDetails;
