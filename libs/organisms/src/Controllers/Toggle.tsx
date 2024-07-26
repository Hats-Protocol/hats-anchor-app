'use client';

import { Flex, HStack, Icon, Skeleton, Text } from '@chakra-ui/react';
import { NULL_ADDRESSES } from '@hatsprotocol/constants';
import { useSelectedHat, useTreeForm } from 'contexts';
import { useHatWearers } from 'hats-hooks';
import _ from 'lodash';
import { useModuleDetails } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { Hex } from 'viem';

import ControllerWearer from './ControllerWearer';
import KnownModule from './modules/KnownToggleModule';

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
  const {
    details: moduleDetails,
    parameters,
    ruleSets,
    isLoading: moduleDetailsLoading,
  } = useModuleDetails({
    address: toggle,
    chainId,
    enabled: toggleData?.isContract, // ? is this reliable enough?
  });
  const isHatsAccount = false; // TODO enable with Hat ID reverse lookup (~2.9)

  if (moduleDetails) {
    return (
      <KnownModule
        moduleDetails={moduleDetails}
        parameters={parameters}
        ruleSets={ruleSets}
        chainId={chainId}
        wearer={toggle}
        selectedHat={selectedHat}
      />
    );
  }

  if (isHatsAccount) {
    // * shouldn't be hitting this flow yet
    return (
      <Flex justify='space-between' py={2} px={{ base: 4, md: 0 }}>
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
    <Skeleton isLoaded={!moduleDetailsLoading} py={2} px={{ base: 4, md: 0 }}>
      <Flex justify='space-between'>
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
