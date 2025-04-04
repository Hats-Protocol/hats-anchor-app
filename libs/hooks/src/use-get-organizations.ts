import { usePrivy } from '@privy-io/react-auth';
import { useQuery } from '@tanstack/react-query';
import { getOrganizations, logger } from 'utils';

interface Organization {
  id: string;
  name: string;
  councils: {
    id: string;
    creator: string;
    chain: number;
    creationForm: {
      id: string;
      creator: string;
      chain: number;
      councilName: string;
    };
  }[];
}

interface OrganizationsResponse {
  organizations: Organization[];
}

export const useGetOrganizations = () => {
  const { getAccessToken } = usePrivy();

  return useQuery<OrganizationsResponse>({
    queryKey: ['organizations'],
    queryFn: async (): Promise<OrganizationsResponse> => {
      logger.info('Fetching organizations...');
      const accessToken = await getAccessToken();
      logger.info('Got access token:', !!accessToken);
      try {
        const response = await getOrganizations({ accessToken });
        logger.info('Raw response:', response);

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
