import { MODULE_INTERFACE } from '@hatsprotocol/constants';
import { Ruleset } from '@hatsprotocol/modules-sdk';
import { useQuery } from '@tanstack/react-query';
import { flatten, forEach, isEmpty, map } from 'lodash';
import { AppHat, SupportedChains } from 'types';
import { viemPublicClient } from 'utils';
import { Hex } from 'viem';

const getCurrentEligibility = async ({
  chainId,
  selectedHat,
  wearerAddress,
  moduleAddresses,
}: {
  chainId: SupportedChains | undefined;
  selectedHat: AppHat | undefined;
  wearerAddress: Hex | undefined;
  moduleAddresses: Hex[];
}) => {
  if (!chainId || !selectedHat || !wearerAddress || isEmpty(moduleAddresses)) {
    // eslint-disable-next-line no-console
    console.log('no selectedHat or wearerAddress or moduleAddresses');
    return null;
  }

  const client = viemPublicClient(chainId);

  const calls = map(moduleAddresses, (moduleAddress) => ({
    address: moduleAddress,
    abi: MODULE_INTERFACE,
    chainId,
    functionName: 'getWearerStatus',
    args: [wearerAddress, selectedHat.id],
  }));

  const results = await client.multicall({
    contracts: calls,
  });
  const eligibleResults = map(results, 'result') as [boolean, boolean][];

  const newObj: { [key: Hex]: { eligible: boolean; goodStanding: boolean } } = {};

  forEach(moduleAddresses, (moduleAddress, index) => {
    newObj[moduleAddress] = {
      eligible: eligibleResults[index][0],
      goodStanding: eligibleResults[index][1],
    };
  });

  return newObj;
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
    queryKey: ['currentEligibility', { chainId, wearerAddress, moduleAddresses, selectedHat }],
    queryFn: () =>
      getCurrentEligibility({
        chainId,
        wearerAddress,
        moduleAddresses,
        selectedHat,
      }),
    enabled: !!chainId && !!selectedHat && !!wearerAddress && !!moduleAddresses,
  });
};

export default useCurrentEligibility;
