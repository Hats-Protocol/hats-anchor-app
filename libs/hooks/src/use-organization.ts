import { usePrivy } from '@privy-io/react-auth';
import { usePrefetchQuery, useQuery } from '@tanstack/react-query';
import { Organization } from 'types';
import { getOrganizationByName } from 'utils';

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
