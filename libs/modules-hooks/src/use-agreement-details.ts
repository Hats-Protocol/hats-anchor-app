import { useQuery } from '@tanstack/react-query';
import { get, toLower } from 'lodash';
import { HatAuthorityResponse, SupportedChains } from 'types';
import { createMeshClient, getAgreementEligibilityQuery, NETWORKS_PREFIX } from 'utils';

const fetchAgreementEligibility = async ({
  id,
  chainId,
}: {
  id: string | undefined;
  chainId: SupportedChains | undefined;
}) => {
  if (!id || !chainId) return null;

  try {
    const client = createMeshClient();
    const query = getAgreementEligibilityQuery(chainId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await client.request(query, { id: toLower(id) });

    const networkPrefix = NETWORKS_PREFIX[chainId];
    // only returning "last" (most recent) agreement
    return get(response, `${networkPrefix}_agreementEligibility`)
      ? get(response, `${networkPrefix}_agreementEligibility`)
      : null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching ancillary modules:', error);
    return null;
  }
};

const useAgreementEligibility = ({ id, chainId }: { id: string | undefined; chainId: SupportedChains | undefined }) => {
  return useQuery({
    queryKey: ['agreementDetails', { id, chainId }],
    queryFn: () => fetchAgreementEligibility({ id, chainId }),
    enabled: !!id && !!chainId, // TODO check if module is agreement module
  });
};

export { useAgreementEligibility };
