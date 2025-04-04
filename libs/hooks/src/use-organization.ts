import { usePrivy } from '@privy-io/react-auth';
import { useQuery } from '@tanstack/react-query';
import { getOrganizationByName } from 'utils';

interface Organization {
  id: string;
  name: string;
  councils: Array<{
    id: string;
    name: string;
  }>;
}

interface OrganizationResponse {
  organizations: Organization[];
}

export function useOrganization(organizationName: string | undefined) {
  const { getAccessToken } = usePrivy();

  return useQuery({
    queryKey: ['organization', organizationName],
    queryFn: async () => {
      if (!organizationName) return null;

      const accessToken = await getAccessToken();
      // Convert kebab-case to original name (e.g., "jp-new-org" -> "jp new org")
      const decodedName = organizationName.replace(/-/g, ' ');

      const result = (await getOrganizationByName({
        name: decodedName,
        accessToken,
      })) as OrganizationResponse;

      return result.organizations[0] ?? null;
    },
    enabled: !!organizationName,
  });
}
