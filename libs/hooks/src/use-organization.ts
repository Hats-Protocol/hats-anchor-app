import { usePrivy } from '@privy-io/react-auth';
import { useQuery } from '@tanstack/react-query';
import { getOrganizationByName } from 'utils';

interface Organization {
  id: string;
  name: string;
  councils: {
    id: string;
    creator: string;
    chain: number;
    treeId: number;
    hsg: string;
    creationForm: {
      id: string;
      creator: string;
      chain: number;
      councilName: string;
    };
  }[];
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
      // Convert kebab-case to spaces for the lookup
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
