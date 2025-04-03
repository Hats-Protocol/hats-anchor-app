import { HATS_MODULE_INTERFACE_ABI } from '@hatsprotocol/constants';
import { Ruleset } from '@hatsprotocol/modules-sdk';
import { useQuery } from '@tanstack/react-query';
import { flatten, forEach, isEmpty, map } from 'lodash';
import type { AppHat, CurrentEligibility, SupportedChains } from 'types';
import { logger, viemPublicClient } from 'utils';
import { Hex } from 'viem';

const getCurrentEligibility = async ({
  chainId,
  selectedHatId,
  wearerAddress,
  moduleAddresses,
}: {
  chainId: SupportedChains | undefined;
  selectedHatId: Hex | undefined;
  wearerAddress: Hex | undefined;
  moduleAddresses: Hex[];
}) => {
  if (!chainId || !selectedHatId || !wearerAddress || isEmpty(moduleAddresses)) {
    logger.error('no selectedHat or wearerAddress or moduleAddresses');
    return Promise.resolve(null);
  }

  const client = viemPublicClient(chainId);

  const calls = map(moduleAddresses, (moduleAddress) => ({
    address: moduleAddress,
    abi: HATS_MODULE_INTERFACE_ABI,
    chainId,
    functionName: 'getWearerStatus',
    args: [wearerAddress, selectedHatId],
  }));

  const results = await client.multicall({
    contracts: calls,
  });
  const eligibleResults = map(results, 'result') as [boolean, boolean][];

  const newObj: CurrentEligibility = {};

  forEach(moduleAddresses, (moduleAddress, index) => {
    newObj[moduleAddress] = {
      eligible: eligibleResults[index][0],
      goodStanding: eligibleResults[index][1],
    };
  });

  return Promise.resolve(newObj);
};

const useCurrentEligibility = ({
  chainId,
  wearerAddress,
  eligibilityRules,
  selectedHat,
}: {
  chainId: SupportedChains | undefined;
  wearerAddress: Hex | undefined;
  eligibilityRules: Ruleset[] | undefined;
  selectedHat: AppHat | undefined; // TODO consider using hatId instead
}) => {
  const moduleAddresses = map(flatten(eligibilityRules), 'address');

  return useQuery({
    queryKey: ['currentEligibility', { chainId, wearerAddress, moduleAddresses, selectedHatId: selectedHat?.id }],
    queryFn: () =>
      getCurrentEligibility({
        chainId,
        wearerAddress,
        moduleAddresses,
        selectedHatId: selectedHat?.id,
      }),
    enabled: !!chainId && !!selectedHat?.id && !!wearerAddress && !!moduleAddresses && !isEmpty(moduleAddresses),
  });
};

export { useCurrentEligibility };
