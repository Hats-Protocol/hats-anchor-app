import { useQuery } from '@tanstack/react-query';
import { MANUAL_APPROVED_TOKENS } from '@hatsprotocol/config';
import { concat, keys } from 'lodash';

const fetchApprovedSymbols = async () => {
  return fetch('https://registry.tkn.eth.limo/')
    .then((response) => response.json())
    .then((data) => concat(keys(data), MANUAL_APPROVED_TOKENS));
};

const useApprovedTokens = () => {
  return useQuery({
    queryKey: ['approvedTokens'],
    queryFn: fetchApprovedSymbols,
  });
};

export { useApprovedTokens };
