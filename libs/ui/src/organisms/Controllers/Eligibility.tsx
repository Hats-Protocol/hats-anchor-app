import { Button, Flex, HStack, Icon, Skeleton, Text } from '@chakra-ui/react';
import {
  FALLBACK_ADDRESS,
  hatIdDecimalToIp,
  hatIdToTreeId,
} from '@hatsprotocol/sdk-v1-core';
import { useSelectedHat } from 'contexts';
import { useModuleDetails } from 'hats-hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { zeroAddress } from 'viem';
import { useAccount } from 'wagmi';

import { ChakraNextLink } from '../../atoms';
import ControllerWearer from './ControllerWearer';
import { ELIGIBILITY_STATUS } from './utils/general';
import useEligibilityRuleDetails from './utils/useEligibilityRuleDetails';

const HatIcon = dynamic(() => import('icons').then((i) => i.HatIcon));

const NULL_ADDRESSES = [FALLBACK_ADDRESS, zeroAddress];

const Eligibility = () => {
  const { selectedHat, chainId } = useSelectedHat();
  const { address } = useAccount();

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
  // console.log('eligibilityData', eligibilityData, moduleDetails, parameters);

  const { data: eligibilityRuleDetails, isLoading: loadingEligibilityRules } =
    useEligibilityRuleDetails({
      selectedHat,
      moduleDetails,
      parameters,
      chainId,
    });
  // console.log(eligibilityRuleDetails);

  if (multipleModules) {
    // * shouldn't be hitting this flow
    return (
      <Flex justify='space-between' py={1}>
        <Text>Comply with 2 rules to keep this Hat</Text>
      </Flex>
    );
  }

  if (moduleDetails && eligibilityRuleDetails) {
    if (eligibilityRuleDetails.status === ELIGIBILITY_STATUS.hat) {
      const moduleHat = _.get(
        _.find(parameters, { displayType: 'hat' }),
        'value',
      );
      return (
        <Flex justify='space-between' py={1}>
          {eligibilityRuleDetails.rule}

          <ChakraNextLink
            href={`/trees/${chainId}/${hatIdToTreeId(
              moduleHat,
            )}?hatId=${hatIdDecimalToIp(moduleHat)}`}
          >
            <HStack spacing={1}>
              <Text>{eligibilityRuleDetails.displayStatus}</Text>
              <Icon as={eligibilityRuleDetails.icon} />
            </HStack>
          </ChakraNextLink>
        </Flex>
      );
    }

    return (
      <Flex justify='space-between' py={1}>
        {eligibilityRuleDetails?.rule}

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
          {_.includes(NULL_ADDRESSES, eligibilityData?.id)
            ? 'No addresses'
            : 'One address'}{' '}
          can remove Wearers
        </Text>

        <ControllerWearer controllerData={eligibilityData} />
      </Flex>
    </Skeleton>
  );
};

export default Eligibility;
