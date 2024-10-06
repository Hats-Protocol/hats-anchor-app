'use client';

import { Box, Flex, Heading, Skeleton, Text } from '@chakra-ui/react';
import { CONFIG, NULL_ADDRESSES } from '@hatsprotocol/constants';
import { useEligibility } from 'contexts';
import { first, flatten, gt, includes, pick, size } from 'lodash';
import { useEligibilityRules } from 'modules-hooks';
import { ModuleDetails } from 'types';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

import {
  AgreementContentModal,
  CommunityHatEligibilityRule,
} from '../agreement';
import { ElectionClaimsModal } from '../election';
import {
  ChainPanel,
  ControllerWearer,
  KnownEligibilityModule,
} from '../eligibility-rules';
import { SubscriptionClaimsModal } from '../subscription';

// relies on different context from Controllers/Eligibility
const MODAL_SUFFIX = 'Claims';
const OVERRIDE_COMMUNITY_HAT = true;

const EligibilityConditions = () => {
  const { address } = useAccount();
  const {
    selectedHat,
    chainId,
    isEligible: isReadyToClaim,
    setIsEligible: setIsReadyToClaim,
  } = useEligibility();

  const { eligibility } = pick(selectedHat, ['eligibility']);
  // const orgChartEligibility = find(orgChartWearers, { id: eligibility });
  // const hatWearerEligibility = find(hatWearers, { id: eligibility });
  const eligibilityData = { id: eligibility as Hex };
  //  hatWearerEligibility ||  orgChartEligibility ||
  // TODO need a lookup if not NULL_ADDRESSES and not in orgChartWearers
  const { data: ruleSets, isLoading: loadingModuleDetails } =
    useEligibilityRules({
      address: eligibility,
      chainId,
      // enabled: orgChartEligibility?.isContract, // ? is this reliable enough?
    });
  const multipleModules = gt(size(flatten(ruleSets)), 1);

  if (multipleModules) {
    return (
      <ChainPanel
        ruleSets={ruleSets || undefined}
        chainId={chainId}
        selectedHat={selectedHat || undefined}
        modalSuffix={MODAL_SUFFIX}
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
        selectedHat={selectedHat || undefined}
        wearer={address as Hex}
        chainId={chainId}
        modalSuffix={MODAL_SUFFIX}
        isReadyToClaim={isReadyToClaim}
        setIsReadyToClaim={setIsReadyToClaim}
      />
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
        isReadyToClaim={isReadyToClaim}
        setIsReadyToClaim={setIsReadyToClaim}
        modalSuffix={MODAL_SUFFIX}
      />
    );
  }

  return (
    <Skeleton isLoaded={!loadingModuleDetails} my={2} mx={{ base: 4, md: 0 }}>
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
export const ClaimsConditions = () => {
  // TODO only include modals that are relevant
  const { isHatDetailsLoading, isModuleDetailsLoading } = useEligibility();

  return (
    <Box w='100%' pb={{ base: 20, md: 0 }}>
      <Skeleton isLoaded={!isHatDetailsLoading && !isModuleDetailsLoading}>
        <Heading size='sm' my={1} px={{ base: 4, md: 0 }}>
          Conditions to wear this Hat
        </Heading>
      </Skeleton>

      <Skeleton
        w='full'
        isLoaded={!isHatDetailsLoading && !isModuleDetailsLoading}
      >
        <EligibilityConditions />
      </Skeleton>

      <AgreementContentModal />
      <SubscriptionClaimsModal />
      <ElectionClaimsModal />
    </Box>
  );
};
