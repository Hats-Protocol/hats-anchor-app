import { useQuery } from '@tanstack/react-query';
import { get, map, toLower } from 'lodash';
import { HatAuthorityResponse, SupportedChains } from 'types';
import { createMeshClient, getAllowlistEligibilityQuery, NETWORKS_PREFIX } from 'utils';

interface RawAllowlist {
  address: string;
  eligible: boolean;
  badStanding: boolean;
}

const fetchAllowlist = async ({ id, chainId }: { id: string | undefined; chainId: SupportedChains | undefined }) => {
  if (!id || !chainId) return null;

  try {
    const client = createMeshClient();
    const query = getAllowlistEligibilityQuery(chainId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await client.request(query, { id: toLower(id) });

    const networkPrefix = NETWORKS_PREFIX[chainId];
    const result = get(response, `${networkPrefix}_allowListEligibility.eligibilityData`) as RawAllowlist[] | undefined;

    if (!result) return null;

    return map(result, (member) => ({
      ...member,
      id: member.address as `0x${string}`, // additionally map to our wearer.id field
    }));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching ancillary modules:', error);
    return null;
  }
};

const useAllowlist = ({ id, chainId }: { id: string | undefined; chainId: SupportedChains | undefined }) => {
  return useQuery({
    queryKey: ['allowlistDetails', { id, chainId }],
    queryFn: () => fetchAllowlist({ id, chainId }),
    enabled: !!id && !!chainId,
  });
};

export { useAllowlist };
