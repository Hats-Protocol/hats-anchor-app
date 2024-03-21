import { Flex, HStack, Icon, Skeleton, Text } from '@chakra-ui/react';
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

import { ChakraNextLink } from '../../atoms';
import ControllerWearer from './ControllerWearer';
import { TOGGLE_STATUS } from './utils/general';
import useToggleRuleDetails from './utils/useToggleRuleDetails';

const HatIcon = dynamic(() => import('icons').then((i) => i.HatIcon));

const NULL_ADDRESSES = [FALLBACK_ADDRESS, zeroAddress];

const Toggle = () => {
  const { selectedHat, chainId } = useSelectedHat();

  const { extendedToggle: toggleData } = _.pick(selectedHat, [
    'extendedToggle',
  ]);
  const { details: moduleDetails, parameters } = useModuleDetails({
    address: toggleData?.id,
    chainId,
    enabled: toggleData?.isContract, // ? is this reliable enough?
  });
  const isHatsAccount = false; // TODO enable with Hat ID reverse lookup (~2.9)

  const { data: toggleRuleDetails, isLoading: loadingToggleRules } =
    useToggleRuleDetails({
      moduleDetails,
      parameters,
      chainId,
      selectedHat,
    });

  if (moduleDetails && toggleRuleDetails) {
    if (toggleRuleDetails.status === TOGGLE_STATUS.hat) {
      const moduleHat = _.get(
        _.find(parameters, { displayType: 'hat' }),
        'value',
      );
      return (
        <Flex justify='space-between' py={1}>
          {toggleRuleDetails.rule}

          <ChakraNextLink
            href={`/trees/${chainId}/${hatIdToTreeId(
              moduleHat,
            )}?hatId=${hatIdDecimalToIp(moduleHat)}`}
          >
            <HStack spacing={1}>
              <Text>{toggleRuleDetails.displayStatus}</Text>
              <Icon as={toggleRuleDetails.icon} />
            </HStack>
          </ChakraNextLink>
        </Flex>
      );
    }

    return (
      <Flex justify='space-between' py={1}>
        {toggleRuleDetails?.rule}

        <HStack
          spacing={1}
          color={
            toggleRuleDetails?.status === TOGGLE_STATUS.active
              ? 'green.600'
              : 'gray.600'
          }
        >
          <Text as='span'>{toggleRuleDetails?.displayStatus}</Text>
          <Icon as={toggleRuleDetails?.icon} />
        </HStack>
      </Flex>
    );
  }

  if (isHatsAccount) {
    // * shouldn't be hitting this flow yet
    return (
      <Flex justify='space-between' py={1}>
        <Text>Another Hat can remove wearers</Text>
        <HStack spacing={1}>
          <Text as='span'>Hat ID</Text>
          <Icon as={HatIcon} />
        </HStack>
      </Flex>
    );
  }

  return (
    <Skeleton isLoaded={!loadingToggleRules || !moduleDetails}>
      <Flex justify='space-between' py={1}>
        <Text>
          {_.includes(NULL_ADDRESSES, toggleData?.id)
            ? 'No addresses'
            : 'One address'}{' '}
          can deactivate this Hat
        </Text>

        <ControllerWearer controllerData={toggleData} />
      </Flex>
    </Skeleton>
  );
};

export default Toggle;
