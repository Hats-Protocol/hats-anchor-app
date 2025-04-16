import { usePrivy } from '@privy-io/react-auth';
import { usePrefetchQuery, useQuery } from '@tanstack/react-query';
import { getOrganizationByName } from 'utils';

interface AdminUser {
  id: string;
  name: string;
  address: string;
  email: string;
}

interface Organization {
  id: string;
  name: string;
  councils: {
    id: string;
    creator: string;
    chain: number;
    treeId: number;
    hsg: string;
    deployed: boolean;
    creationForm: {
      id: string;
      creator: string;
      chain: number;
      councilName: string;
      members: AdminUser[];
      admins: AdminUser[];
      agreement: string;
      agreementAdmins: {
        id: string;
        name: string;
        address: string;
      }[];
      tokenAmount: string;
      tokenAddress: string;
      complianceAdmins: {
        id: string;
        name: string;
        address: string;
      }[];
    };
  }[];
}

interface OrganizationResponse {
  organizations: Organization[];
}

export function useOrganization(organizationName: string | undefined) {
  const { getAccessToken } = usePrivy();
  const queryKey = ['organization', organizationName];

  const queryFn = async () => {
    if (!organizationName) return null;
    const accessToken = await getAccessToken();
    const decodedName = organizationName.replace(/-/g, ' ');
    const result = (await getOrganizationByName({
      name: decodedName,
      accessToken,
    })) as OrganizationResponse;
    return result.organizations[0] ?? null;
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
    enabled: !!organizationName,
  });
}
