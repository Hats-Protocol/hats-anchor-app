import { usePrivy } from '@privy-io/react-auth';
import { useQuery } from '@tanstack/react-query';
import { Organization } from 'types';
import { getOrganizations, logger } from 'utils';

interface OrganizationsResponse {
  organizations: Organization[];
}

export const useGetOrganizations = () => {
  const { getAccessToken } = usePrivy();

  return useQuery<OrganizationsResponse>({
    queryKey: ['organizations'],
    queryFn: async (): Promise<OrganizationsResponse> => {
      const accessToken = await getAccessToken();

      try {
        const response = await getOrganizations({ accessToken });

        // The response is already in the correct format, no need to access .data
        const typedResponse = response as OrganizationsResponse;
        if (!typedResponse?.organizations) {
          throw new Error('Invalid response format from organizations query');
        }

        return typedResponse;
      } catch (error) {
        logger.error('Error fetching organizations:', error);
        throw error;
      }
    },
  });
};

export type { Organization, OrganizationsResponse };
