'use client';

import { Flex, HStack, Icon, Skeleton, Text } from '@chakra-ui/react';
import { CONFIG, NULL_ADDRESSES } from '@hatsprotocol/constants';
import { useSelectedHat, useTreeForm } from 'contexts';
import { find, first, flatten, gt, includes, pick, size } from 'lodash';
import { useEligibilityRules } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { eligibilityRuleToModuleDetails } from 'utils';
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
  // console.log({ eligibilityData });

  // TODO need a lookup if not NULL_ADDRESSES and not in orgChartWearers
  const { data: rawEligibilityRules, isLoading: loadingModuleDetails } =
    useEligibilityRules({
      address: eligibility,
      chainId,
      enabled: orgChartEligibility?.isContract, // ? is this reliable enough?
    });

  const ruleSets = flatten(rawEligibilityRules);
  const multipleModules = gt(size(ruleSets), 1);
  const isHatsAccount = false; // TODO enable with Hat ID reverse lookup

  if (multipleModules) {
    return (
      <ChainPanel
        ruleSets={rawEligibilityRules || undefined}
        chainId={chainId}
        selectedHat={selectedHat}
        modalSuffix={modalSuffix}
      />
    );
  }

  if (ruleSets) {
    const moduleDetails = eligibilityRuleToModuleDetails(first(ruleSets));

    return (
      <KnownEligibilityModule
        moduleDetails={moduleDetails}
        moduleParameters={moduleDetails?.liveParameters}
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
