import { usePrivy } from '@privy-io/react-auth';
import { usePrefetchQuery, useQuery } from '@tanstack/react-query';
import { Organization } from 'types';
import { getUserOrganizations, logger } from 'utils';

interface OrganizationsResponse {
  organizations: Organization[];
}

export function useGetUserOrganizations(userAddress: string | undefined) {
  const { getAccessToken } = usePrivy();
  const queryKey = ['organizations', userAddress];

  const queryFn = async (): Promise<OrganizationsResponse | null> => {
    if (!userAddress) {
      return null;
    }

    const accessToken = await getAccessToken();

    try {
      const result = await getUserOrganizations({
        userAddress: userAddress,
        accessToken,
      });
      logger.info('Raw API response received:', result);

      const typedResult = result as OrganizationsResponse;
      logger.info('Typed result:', typedResult);

      return typedResult;
    } catch (error) {
      logger.error('Error in getUserOrganizations:', error);
      throw error;
    }
  };

  // prefetch the data without triggering a re-render
  usePrefetchQuery({
    queryKey,
    queryFn,
    staleTime: 0, // always prefetch fresh data
  });

  return useQuery({
    queryKey,
    queryFn,
    enabled: !!userAddress,
  });
}
