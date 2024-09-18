import { useQuery } from '@tanstack/react-query';
import { fetchWearersProfileDetails } from 'utils';
import { Hex } from 'viem';

const useProfileDetails = ({
  addresses,
  chainId,
}: {
  addresses: Hex[];
  chainId: number | undefined;
}) => {

  return useQuery({
    queryKey: ['profileDetails', { addresses, chainId }],
    queryFn: () => fetchWearersProfileDetails(addresses, chainId),
  })
};

export default useProfileDetails;
