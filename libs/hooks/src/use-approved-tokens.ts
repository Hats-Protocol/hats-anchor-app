import { MANUAL_APPROVED_TOKENS } from '@hatsprotocol/config';
import { useQuery } from '@tanstack/react-query';
import { concat, keys } from 'lodash';
import { logger } from 'utils';

const fetchApprovedSymbols = async () => {
  try {
    const response = await fetch('https://registry.tkn.eth.limo/', {
      headers: {
        Accept: 'application/json',
        Origin: window.location.origin,
      },
      mode: 'cors',
      credentials: 'omit',
    });

    if (!response.ok) {
      logger.error('Failed to fetch approved symbols:', response.status, response.statusText);
      // Fallback to manual tokens if fetch fails
      return MANUAL_APPROVED_TOKENS;
    }

    const data = await response.json();
    return concat(keys(data), MANUAL_APPROVED_TOKENS);
  } catch (error) {
    logger.error('Error fetching approved symbols:', error);
    // Fallback to manual tokens if fetch fails
    return MANUAL_APPROVED_TOKENS;
  }
};

logger.info('fetchApprovedSymbols', fetchApprovedSymbols);

const useApprovedTokens = () => {
  return useQuery({
    queryKey: ['approvedTokens'],
    queryFn: fetchApprovedSymbols,
    retry: 2, // Retry failed requests twice
    staleTime: 1000 * 60 * 60, // Consider data fresh for 1 hour
  });
};

export { useApprovedTokens };
