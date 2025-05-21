import { useQuery } from '@tanstack/react-query';
import { get } from 'lodash';
import { logger } from 'utils';

const fetchTokenPrices = async () => {
  try {
    const response = await fetch('/api/token-prices');

    if (!response.ok) {
      logger.error('Failed to fetch token prices:', response.status, response.statusText);
      return { data: [] };
    }

    return response.json();
  } catch (error) {
    logger.error('Error fetching token prices:', error);
    return { data: [] };
  }
};

const useTokenPrices = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['tokenPrices'],
    queryFn: fetchTokenPrices,
    refetchInterval: 60000, // Refetch every minute
    retry: 2, // Retry failed requests twice
  });

  return {
    data: get(data, 'data'),
    lastUpdated: get(data, 'timestamp'),
    isLoading,
    error,
  };
};

export { useTokenPrices };
