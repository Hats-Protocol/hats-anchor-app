import { hatIdDecimalToHex } from '@hatsprotocol/sdk-v1-core';
import { useQuery } from '@tanstack/react-query';
import { useHatDetails } from 'hats-hooks';
import { get, map, toLower } from 'lodash';
import { SupportedChains } from 'types';
import { createMeshClient, getHatWearingEligibilityQuery, NETWORKS_PREFIX } from 'utils';

const fetchHatWearingEligibility = async ({
  id,
  chainId,
}: {
  id: string | undefined;
  chainId: SupportedChains | undefined;
}) => {
  if (!id || !chainId) return null;

  try {
    const client = createMeshClient();
    const query = getHatWearingEligibilityQuery(chainId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await client.request(query, { id: toLower(id) });

    const networkPrefix = NETWORKS_PREFIX[chainId];
    const criterionHat = get(response, `${networkPrefix}_hatWearingEligibility.criterionHat`);

    if (!criterionHat) return null;

    return criterionHat;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching hat wearing eligibility:', error);
    return null;
  }
};

const useHatWearingEligibility = ({
  id,
  chainId,
}: {
  id: string | undefined;
  chainId: SupportedChains | undefined;
}) => {
  // First, fetch the criterion hat ID from the eligibility module
  const criterionHatQuery = useQuery({
    queryKey: ['hatWearingEligibility', { id, chainId }],
    queryFn: () => fetchHatWearingEligibility({ id, chainId }),
    enabled: !!id && !!chainId,
  });

  const criterionHatId = criterionHatQuery.data;
  const criterionHatIdHex = criterionHatId ? hatIdDecimalToHex(BigInt(criterionHatId)) : undefined;

  // Then, fetch the wearers of that criterion hat
  const { data: hat, isLoading: isHatWearersLoading } = useHatDetails({
    hatId: criterionHatIdHex,
    chainId: chainId as SupportedChains,
  });

  // Convert hat wearers to the expected format similar to allowlist
  let eligibilityData = null;
  if (hat?.wearers) {
    eligibilityData = map(hat.wearers, (wearer) => ({
      id: wearer.id as `0x${string}`,
      address: wearer.id,
      eligible: true,
      badStanding: false,
    }));
  }

  return {
    data: eligibilityData,
    isLoading: criterionHatQuery.isLoading || isHatWearersLoading,
    error: criterionHatQuery.error,
    criterionHatId: criterionHatIdHex,
  };
};

export { useHatWearingEligibility };
