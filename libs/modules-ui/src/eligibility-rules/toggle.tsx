'use client';

import { Flex, HStack, Icon, Skeleton, Text } from '@chakra-ui/react';
import { NULL_ADDRESSES } from '@hatsprotocol/constants';
import { useSelectedHat, useTreeForm } from 'contexts';
import { find, includes, pick } from 'lodash';
import { useEligibilityRules } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { Hex } from 'viem';

import { ControllerWearer } from './controller-wearer';
import { KnownToggleModule } from './known-toggle-module';

const HatIcon = dynamic(() => import('icons').then((i) => i.HatIcon));

export const Toggle = () => {
  const { orgChartWearers } = useTreeForm();
  const { selectedHat, chainId } = useSelectedHat();

  const { toggle } = pick(selectedHat, ['toggle']);
  const toggleData = find(orgChartWearers, { id: toggle }) || {
    id: toggle as Hex,
  };
  // TODO need a lookup if not NULL_ADDRESSES and not in orgChartWearers
  const { data: ruleSets, isLoading: moduleDetailsLoading } =
    useEligibilityRules({
      address: toggle,
      chainId,
      enabled: toggleData?.isContract, // ? is this reliable enough?
    });
  const isHatsAccount = false; // TODO enable with Hat ID reverse lookup (~2.9)

  if (ruleSets) {
    return (
      <KnownToggleModule
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
        <Text>Another Hat can remove wearers</Text>
        <HStack spacing={1}>
          <Text>Hat ID</Text>
          <Icon as={HatIcon} boxSize={{ base: '14px', md: 4 }} />
        </HStack>
      </Flex>
    );
  }

  return (
    <Skeleton isLoaded={!moduleDetailsLoading} my={2} mx={{ base: 4, md: 0 }}>
      <Flex justify='space-between'>
        <Text>
          {includes(NULL_ADDRESSES, toggle) ? 'No addresses' : 'One address'}{' '}
          can deactivate this Hat
        </Text>

        <ControllerWearer controllerData={toggleData} />
      </Flex>
    </Skeleton>
  );
};
