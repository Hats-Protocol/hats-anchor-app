import { Button, Flex, HStack, Icon, Skeleton, Text } from '@chakra-ui/react';
import { NULL_ADDRESSES } from '@hatsprotocol/constants';
import { hatIdDecimalToIp, hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { useSelectedHat, useTreeForm } from 'contexts';
import { useModuleDetails } from 'hats-hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

import { ChakraNextLink } from '../../atoms';
import ControllerWearer from './ControllerWearer';
import { ELIGIBILITY_STATUS } from './utils/general';
import useEligibilityRuleDetails from './utils/useEligibilityRuleDetails';

const HatIcon = dynamic(() => import('icons').then((i) => i.HatIcon));

const Eligibility = () => {
  const { orgChartWearers } = useTreeForm();
  const { selectedHat, chainId } = useSelectedHat();
  const { address } = useAccount();

  const { eligibility } = _.pick(selectedHat, ['eligibility']);
  const orgChartEligibility = _.find(orgChartWearers, { id: eligibility });
  // TODO need a lookup if not NULL_ADDRESSES and not in orgChartWearers
  const {
    details: moduleDetails,
    parameters,
    isLoading,
  } = useModuleDetails({
    address: eligibility,
    chainId,
    enabled: orgChartEligibility?.isContract, // ? is this reliable enough?
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

  if (multipleModules) {
    // * shouldn't be hitting this flow
    return (
      <Flex justify='space-between' py={1}>
        <Text fontSize={{ base: 'sm', md: 'md' }}>
          Comply with 2 rules to keep this Hat
        </Text>
      </Flex>
    );
  }

  if (moduleDetails) {
    if (eligibilityRuleDetails?.status === ELIGIBILITY_STATUS.hat) {
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
              <Text fontSize={{ base: 'sm', md: 'md' }}>
                {eligibilityRuleDetails.displayStatus}
              </Text>
              <Icon
                as={eligibilityRuleDetails.icon}
                boxSize={{ base: '14px', md: 4 }}
              />
            </HStack>
          </ChakraNextLink>
        </Flex>
      );
    }

    return (
      <Skeleton isLoaded={!isLoading && !loadingEligibilityRules}>
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
              <Text fontSize={{ base: 'sm', md: 'md' }}>
                {eligibilityRuleDetails?.displayStatus}
              </Text>
              <Icon
                as={eligibilityRuleDetails?.icon}
                boxSize={{ base: '14px', md: 4 }}
              />
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
      </Skeleton>
    );
  }

  if (isHatsAccount) {
    // * shouldn't be hitting this flow
    return (
      <Flex justify='space-between' py={1}>
        <Text fontSize={{ base: 'sm', md: 'md' }}>
          Another Hat can remove wearers
        </Text>

        <HStack spacing={1}>
          <Text fontSize={{ base: 'sm', md: 'md' }}>Hat ID</Text>
          <Icon as={HatIcon} boxSize={{ base: '14px', md: 4 }} />
        </HStack>
      </Flex>
    );
  }

  return (
    <Skeleton isLoaded={!loadingEligibilityRules || !moduleDetails}>
      <Flex justify='space-between' py={2}>
        <Text fontSize={{ base: 'sm', md: 'md' }}>
          {_.includes(NULL_ADDRESSES, eligibility)
            ? 'No addresses'
            : 'One address'}{' '}
          can remove Wearers
        </Text>

        <ControllerWearer
          controllerData={orgChartEligibility || { id: eligibility as Hex }}
        />
      </Flex>
    </Skeleton>
  );
};

export default Eligibility;
