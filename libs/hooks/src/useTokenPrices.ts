import { useQuery } from '@tanstack/react-query';
import { get } from 'lodash';

const fetchTokenPrices = async () => {
  return fetch('https://api.coincap.io/v2/assets?limit=1000')
    .then((res) => res.json())
    .then((data) => data);
};

const useTokenPrices = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['tokenPrices'],
    queryFn: fetchTokenPrices,
  });

  return {
    data: get(data, 'data'),
    lastUpdated: get(data, 'timestamp'),
    isLoading,
    error,
  };
};

export default useTokenPrices;
