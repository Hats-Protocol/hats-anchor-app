'use client';

import { Box, Flex, Heading, Skeleton, Text } from '@chakra-ui/react';
import { CONFIG, NULL_ADDRESSES } from '@hatsprotocol/constants';
import { useEligibility } from 'contexts';
import { first, flatten, gt, includes, pick, size } from 'lodash';
import { eligibilityRuleToModuleDetails } from 'utils';
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
import { ClaimButton } from './claim-button';

// relies on different context from Controllers/Eligibility
const MODAL_SUFFIX = 'Claims';
const OVERRIDE_COMMUNITY_HAT = true;

const EligibilityConditions = () => {
  const { address } = useAccount();
  const {
    selectedHat,
    chainId,
    eligibilityRules,
    isReadyToClaim,
    setIsReadyToClaim,
    isEligibilityRulesLoading,
    currentEligibility,
  } = useEligibility();

  const { eligibility } = pick(selectedHat, ['eligibility']);
  const eligibilityData = { id: eligibility as Hex };

  const multipleModules = gt(size(flatten(eligibilityRules)), 1);
  console.log('multipleModules', multipleModules, eligibilityRules);

  if (multipleModules) {
    return (
      <ChainPanel
        ruleSets={eligibilityRules || undefined}
        chainId={chainId}
        selectedHat={selectedHat || undefined}
        modalSuffix={MODAL_SUFFIX}
        isReadyToClaim={isReadyToClaim}
        setIsReadyToClaim={setIsReadyToClaim}
        currentEligibility={currentEligibility}
        defaultOpen
      />
    );
  }

  if (eligibilityRules) {
    const moduleDetails = eligibilityRuleToModuleDetails(
      first(flatten(eligibilityRules)),
    );
    console.log('moduleDetails', moduleDetails);

    return (
      <KnownEligibilityModule
        moduleDetails={moduleDetails}
        moduleParameters={moduleDetails?.liveParameters}
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
    <Skeleton
      isLoaded={!isEligibilityRulesLoading}
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

export const ClaimsConditions = () => {
  // TODO only include modals that are relevant
  const { isHatDetailsLoading, isEligibilityRulesLoading } = useEligibility();

  return (
    <Box w='100%' pb={{ base: 20, md: 0 }}>
      <Skeleton isLoaded={!isHatDetailsLoading && !isEligibilityRulesLoading}>
        <Heading size='sm' my={1} px={{ base: 4, md: 0 }}>
          Conditions to wear this {CONFIG.TERMS.hat}
        </Heading>
      </Skeleton>

      <Skeleton
        w='full'
        isLoaded={!isHatDetailsLoading && !isEligibilityRulesLoading}
      >
        <EligibilityConditions />
      </Skeleton>

      <Skeleton
        w='full'
        mt={4}
        isLoaded={!isHatDetailsLoading && !isEligibilityRulesLoading}
      >
        <Flex display={{ base: 'none', '2xl': 'flex' }} justify='center'>
          <ClaimButton />
        </Flex>
      </Skeleton>

      <AgreementContentModal />

      <SubscriptionClaimsModal />

      <ElectionClaimsModal />
    </Box>
  );
};
