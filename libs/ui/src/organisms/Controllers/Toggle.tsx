import { Flex, HStack, Icon, Skeleton, Text } from '@chakra-ui/react';
import { NULL_ADDRESSES } from '@hatsprotocol/constants';
import { hatIdDecimalToIp, hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { useSelectedHat, useTreeForm } from 'contexts';
import { useHatWearers, useModuleDetails } from 'hats-hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { Hex } from 'viem';

import { ChakraNextLink } from '../../atoms';
import ControllerWearer from './ControllerWearer';
import { TOGGLE_STATUS } from './utils/general';
import useToggleRuleDetails from './utils/useToggleRuleDetails';

const HatIcon = dynamic(() => import('icons').then((i) => i.HatIcon));

const Toggle = () => {
  const { orgChartWearers } = useTreeForm();
  const { selectedHat, chainId } = useSelectedHat();

  const { data: hatWearers } = useHatWearers({
    hat: selectedHat,
    chainId,
  });

  const { toggle } = _.pick(selectedHat, ['toggle']);
  const hatWearerToggle = _.find(hatWearers, { id: toggle });
  const toggleData = hatWearerToggle ||
    _.find(orgChartWearers, { id: toggle }) || {
      id: toggle as Hex,
    };
  // TODO need a lookup if not NULL_ADDRESSES and not in orgChartWearers
  const { details: moduleDetails, parameters } = useModuleDetails({
    address: toggle,
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

  if (moduleDetails) {
    if (toggleRuleDetails?.status === TOGGLE_STATUS.hat) {
      const moduleHat = _.get(
        _.find(parameters, { displayType: 'hat' }),
        'value',
      ) as bigint | undefined;
      if (!moduleHat) return null; // ? should never happen
      return (
        <Flex justify='space-between' py={1}>
          {toggleRuleDetails.rule}

          <ChakraNextLink
            href={`/trees/${chainId}/${hatIdToTreeId(
              moduleHat,
            )}?hatId=${hatIdDecimalToIp(moduleHat)}`}
          >
            <HStack spacing={1}>
              <Text fontSize={{ base: 'sm', md: 'md' }}>
                {toggleRuleDetails.displayStatus}
              </Text>
              <Icon
                as={toggleRuleDetails.icon}
                boxSize={{ base: '14px', md: 4 }}
              />
            </HStack>
          </ChakraNextLink>
        </Flex>
      );
    }

    return (
      <Skeleton isLoaded={!loadingToggleRules}>
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
            <Text fontSize={{ base: 'sm', md: 'md' }}>
              {toggleRuleDetails?.displayStatus}
            </Text>
            <Icon
              as={toggleRuleDetails?.icon}
              boxSize={{ base: '14px', md: 4 }}
            />
          </HStack>
        </Flex>
      </Skeleton>
    );
  }

  if (isHatsAccount) {
    // * shouldn't be hitting this flow yet
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
    <Skeleton isLoaded={!loadingToggleRules || !moduleDetails}>
      <Flex justify='space-between' py={1}>
        <Text fontSize={{ base: 'sm', md: 'md' }}>
          {_.includes(NULL_ADDRESSES, toggle) ? 'No addresses' : 'One address'}{' '}
          can deactivate this Hat
        </Text>

        <ControllerWearer controllerData={toggleData} />
      </Flex>
    </Skeleton>
  );
};

export default Toggle;
