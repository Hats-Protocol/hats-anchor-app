import { hatIdDecimalToHex } from '@hatsprotocol/sdk-v1-core';
import { useQuery } from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { useHatDetails } from 'hats-hooks';
import { get, map, toLower } from 'lodash';
import { SupportedChains } from 'types';
import { ancillarySubgraphClient } from 'utils';

const HAT_WEARING_ELIGIBILITY_QUERY = gql`
  query GetHatWearingEligibility($id: ID!) {
    hatWearingEligibility(id: $id) {
      criterionHat
    }
  }
`;

interface HatWearingEligibilityResponse {
  hatWearingEligibility: {
    criterionHat: string;
  } | null;
}

const fetchHatWearingEligibility = async ({
  id,
  chainId,
}: {
  id: string | undefined;
  chainId: SupportedChains | undefined;
}) => {
  if (!id || !chainId) return null;

  try {
    // TODO migrate to mesh
    const client = ancillarySubgraphClient(chainId);
    if (!client) return null;

    const response = await client.request<HatWearingEligibilityResponse>(HAT_WEARING_ELIGIBILITY_QUERY, {
      id: toLower(id),
    });

    const criterionHat = get(response, 'hatWearingEligibility.criterionHat');

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
