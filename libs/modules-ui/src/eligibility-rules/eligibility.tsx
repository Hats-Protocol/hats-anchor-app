'use client';

import { Flex, HStack, Icon, Skeleton, Text } from '@chakra-ui/react';
import { CONFIG, NULL_ADDRESSES } from '@hatsprotocol/constants';
import { useSelectedHat, useTreeForm } from 'contexts';
import { find, first, flatten, gt, includes, pick, size } from 'lodash';
import { useEligibilityRules } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { ModuleDetails } from 'types';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

import { CommunityHatEligibilityRule } from '../agreement';
import { ChainPanel } from './chain-panel';
import { ControllerWearer } from './controller-wearer';
import { KnownEligibilityModule } from './known-eligibility-module';

const HatIcon = dynamic(() => import('icons').then((i) => i.HatIcon));

const OVERRIDE_COMMUNITY_HAT = true;

// CURRENTLY REQUIRES TREE FORM context and SELECTED HAT context
export const Eligibility = ({
  modalSuffix,
}: {
  modalSuffix?: string | undefined;
}) => {
  const { orgChartWearers } = useTreeForm();
  const { selectedHat, chainId } = useSelectedHat();
  const { address } = useAccount();

  const { eligibility } = pick(selectedHat, ['eligibility']);
  const orgChartEligibility = find(orgChartWearers, { id: eligibility });
  const eligibilityData = orgChartEligibility || { id: eligibility as Hex };

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
        modalSuffix={modalSuffix}
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
      <KnownEligibilityModule
        moduleDetails={{ ...moduleDetails, id: instance } as ModuleDetails}
        moduleParameters={parameters}
        selectedHat={selectedHat}
        wearer={address as Hex}
        chainId={chainId}
        modalSuffix={modalSuffix}
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

  if (
    OVERRIDE_COMMUNITY_HAT &&
    selectedHat?.id === CONFIG.agreementV0.communityHatId
  ) {
    return (
      <CommunityHatEligibilityRule
        selectedHat={selectedHat}
        wearer={address as Hex}
        chainId={chainId}
      />
    );
  }

  return (
    <Skeleton
      isLoaded={!loadingModuleDetails || orgChartEligibility?.isContract}
      my={2}
      mx={{ base: 4, md: 0 }}
    >
      <Flex justify='space-between'>
        <Text>
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
