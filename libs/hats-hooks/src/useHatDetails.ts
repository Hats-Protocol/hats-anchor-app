import { ZERO_ID } from '@hatsprotocol/constants';
import { useQuery } from '@tanstack/react-query';
import { first, get } from 'lodash';
import { AppHat, HatDetails, SupportedChains } from 'types';
import { fetchHatsDetailsMesh } from 'utils';

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
  const id = hatId ? [hatId] : [];
  const { data, isLoading, error } = useQuery({
    queryKey: ['hatDetails', { id, chainId }],
    queryFn: () => fetchHatsDetailsMesh(id, chainId),
    enabled:
      !!hatId &&
      hatId !== ZERO_ID &&
      hatId !== 'undefined' && // ? why is hatId getting set to undefined string?
      hatId !== '0x' &&
      !!chainId,
    staleTime: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
    initialData: initialData ? [initialData] : undefined,
  });

  const metadata = get(first(data), 'detailsMetadata');
  const fullDetails = metadata ? JSON.parse(metadata) : {};
  const details = get(fullDetails, 'data');

  return { data: first(data), details: details as HatDetails, isLoading, error };
};

export default useHatDetails;
