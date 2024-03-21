import { Button, Flex, HStack, Icon, Skeleton, Text } from '@chakra-ui/react';
import { FALLBACK_ADDRESS } from '@hatsprotocol/sdk-v1-core';
import { useSelectedHat } from 'contexts';
import { useModuleDetails } from 'hats-hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { formatAddress } from 'utils';
import { useAccount } from 'wagmi';

import ControllerWearer from './ControllerWearer';
import useEligibilityRuleDetails from './utils/useEligibilityRuleDetails';

const HatIcon = dynamic(() => import('icons').then((i) => i.HatIcon));

const Eligibility = () => {
  const { selectedHat, chainId } = useSelectedHat();
  const { address } = useAccount();
  console.log(selectedHat);

  const { extendedEligibility: eligibilityData } = _.pick(selectedHat, [
    'extendedEligibility',
  ]);
  const { details: moduleDetails, parameters } = useModuleDetails({
    address: eligibilityData?.id,
    chainId,
    enabled: eligibilityData?.isContract, // ? is this reliable enough?
  });
  const multipleModules = false; // TODO enable with multiple modules (~2.8)
  const isHatsAccount = false; // TODO enable with Hat ID reverse lookup (~2.9)

  const name = eligibilityData?.ensName || formatAddress(eligibilityData?.id);

  const { data: eligibilityRuleDetails, isLoading: loadingEligibilityRules } =
    useEligibilityRuleDetails({ moduleDetails, parameters, chainId });

  if (multipleModules) {
    // * shouldn't be hitting this flow
    return (
      <Flex justify='space-between' py={1}>
        <Text>Comply with 2 rules to keep this Hat</Text>
      </Flex>
    );
  }
  console.log(eligibilityData);

  if (moduleDetails && eligibilityRuleDetails) {
    return (
      <Flex justify='space-between' py={1}>
        <Text>{eligibilityRuleDetails?.rule}</Text>

        {address ? (
          <HStack
            spacing={1}
            color={
              eligibilityRuleDetails?.status === 'eligible'
                ? 'green.600'
                : 'gray.600'
            }
          >
            <Text>{eligibilityRuleDetails?.displayStatus}</Text>
            <Icon as={eligibilityRuleDetails?.icon} />
          </HStack>
        ) : (
          <Button
            size='xs'
            fontWeight='medium'
            color='blue.500'
            variant='ghost'
          >
            Check Eligibility
          </Button>
        )}
      </Flex>
    );
  }

  if (isHatsAccount) {
    // * shouldn't be hitting this flow
    return (
      <Flex justify='space-between' py={1}>
        <Text>Another Hat can remove wearers</Text>

        <HStack spacing={1}>
          <Text>Hat ID</Text>
          <Icon as={HatIcon} />
        </HStack>
      </Flex>
    );
  }

  return (
    <Skeleton isLoaded={!loadingEligibilityRules || !moduleDetails}>
      <Flex justify='space-between' py={2}>
        <Text>
          {eligibilityData?.id === FALLBACK_ADDRESS
            ? 'No addresses'
            : 'One address'}{' '}
          can remove Wearers
        </Text>

        <ControllerWearer
          address={eligibilityData?.id}
          isContract={eligibilityData?.isContract}
          name={name}
        />
      </Flex>
    </Skeleton>
  );
};

export default Eligibility;
