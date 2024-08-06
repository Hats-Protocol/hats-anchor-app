import { useQuery } from '@tanstack/react-query';
import { keys } from 'lodash';

const fetchApprovedSymbols = async () => {
  return fetch('https://registry.tkn.eth.limo/')
    .then((response) => response.json())
    .then((data) => keys(data));
};

const useApprovedTokens = () => {
  return useQuery({
    queryKey: ['approvedTokens'],
    queryFn: fetchApprovedSymbols,
  });
};

export default useApprovedTokens;
