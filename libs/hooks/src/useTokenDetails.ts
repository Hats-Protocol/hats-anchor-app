import { useQuery } from '@tanstack/react-query';
import { fetchTokenData } from 'utils';

const useTokenDetails = ({ symbol }: { symbol: string }) => {
  return useQuery({
    queryKey: ['tokenDetails', symbol],
    queryFn: () => fetchTokenData({ symbol }),
    enabled: !!symbol,
  });
};

export default useTokenDetails;
