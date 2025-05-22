import { MANUAL_APPROVED_TOKENS } from '@hatsprotocol/config';
import { useQuery } from '@tanstack/react-query';
import { concat, keys } from 'lodash';
import { logger } from 'utils';

const fetchApprovedSymbols = async () => {
  try {
    const response = await fetch('https://registry.tkn.eth.limo/', {
      headers: {
        Accept: 'application/json',
      },
      // Remove CORS mode to let the browser handle it
      credentials: 'omit',
    });

    if (!response.ok) {
      logger.error('Failed to fetch approved symbols:', response.status, response.statusText);
      return MANUAL_APPROVED_TOKENS;
    }

    const data = await response.json();
    // Ensure we get all tokens including RARE and USDC
    const registryTokens = keys(data);
    logger.info('Fetched tokens from registry:', registryTokens);

    // Combine registry tokens with manual tokens, removing duplicates
    const allTokens = concat(registryTokens, MANUAL_APPROVED_TOKENS);
    const uniqueTokens = [...new Set(allTokens)];

    logger.info('Final token list:', uniqueTokens);
    return uniqueTokens;
  } catch (error) {
    logger.error('Error fetching approved symbols:', error);
    return MANUAL_APPROVED_TOKENS;
  }
};

const useApprovedTokens = () => {
  return useQuery({
    queryKey: ['approvedTokens'],
    queryFn: fetchApprovedSymbols,
    retry: 2,
    staleTime: 1000 * 60 * 60, // Consider data fresh for 1 hour
  });
};

export { useApprovedTokens };
