'use client';

import { Flex, HStack, Icon, Skeleton, Text } from '@chakra-ui/react';
import { NULL_ADDRESSES } from '@hatsprotocol/constants';
import { useSelectedHat, useTreeForm } from 'contexts';
import { useHatWearers } from 'hats-hooks';
import { find, first, flatten, gt, includes, pick, size } from 'lodash';
import { useEligibilityRules } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { ModuleDetails } from 'types';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

import ChainPanel from './ChainPanel';
import ControllerWearer from './ControllerWearer';
import KnownModule from './modules/KnownEligibilityModule';

const HatIcon = dynamic(() => import('icons').then((i) => i.HatIcon));

const Eligibility = () => {
  const { orgChartWearers } = useTreeForm();
  const { selectedHat, chainId } = useSelectedHat();
  const { address } = useAccount();

  const { data: hatWearers, isLoading: hatWearersLoading } = useHatWearers({
    hat: selectedHat,
    chainId,
  });

  const { eligibility } = pick(selectedHat, ['eligibility']);
  const orgChartEligibility = find(orgChartWearers, { id: eligibility });
  const hatWearerEligibility = find(hatWearers, { id: eligibility });
  const eligibilityData = hatWearerEligibility ||
    orgChartEligibility || { id: eligibility as Hex };
  // TODO need a lookup if not NULL_ADDRESSES and not in orgChartWearers
  const { data: ruleSets, isLoading: loadingModuleDetails } =
    useEligibilityRules({
      address: eligibility,
      chainId,
      enabled: orgChartEligibility?.isContract, // ? is this reliable enough?
    });
  const multipleModules = gt(size(flatten(ruleSets)), 1);
  const isHatsAccount = false; // TODO enable with Hat ID reverse lookup (~2.9)

  if (multipleModules) {
    return (
      <ChainPanel
        ruleSets={ruleSets || undefined}
        chainId={chainId}
        selectedHat={selectedHat}
      />
    );
  }

  if (ruleSets) {
    const {
      module: moduleDetails,
      address: instance,
      liveParams: parameters,
    } = pick(first(first(ruleSets)), ['module', 'address', 'liveParams']);

    return (
      <KnownModule
        moduleDetails={{ ...moduleDetails, id: instance } as ModuleDetails}
        moduleParameters={parameters}
        selectedHat={selectedHat}
        wearer={address as Hex}
        chainId={chainId}
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
    <Skeleton
      isLoaded={
        !hatWearersLoading &&
        (!loadingModuleDetails || orgChartEligibility?.isContract)
      }
      py={2}
      px={{ base: 4, md: 0 }}
    >
      <Flex justify='space-between'>
        <Text fontSize={{ base: 'sm', md: 'md' }}>
          {includes(NULL_ADDRESSES, eligibility)
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
