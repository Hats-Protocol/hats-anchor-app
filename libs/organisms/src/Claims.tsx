'use client';

import { Card, CardBody, Heading, Skeleton, Stack, Text } from '@chakra-ui/react';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { CONFIG } from '@hatsprotocol/config';
import { useEligibility } from 'contexts';
import { useMediaStyles } from 'hooks';
import { first, flatten, get, size } from 'lodash';
import { useModuleDetails } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { Link } from 'ui';
import { chainsMap, eligibilityRuleToModuleDetails, hatLink } from 'utils';

const AgreementClaims = dynamic(() => import('modules-ui').then((mod) => mod.AgreementClaims));
const ElectionClaims = dynamic(() => import('modules-ui').then((mod) => mod.ElectionClaims));
const SubscriptionClaims = dynamic(() => import('modules-ui').then((mod) => mod.SubscriptionClaims));
const SlimModuleDetails = dynamic(() => import('modules-ui').then((mod) => mod.SlimModuleDetails));
const ModuleChainClaimButtons = dynamic(() => import('modules-ui').then((mod) => mod.ModuleChainClaimButtons));
const ModuleChainClaimsCard = dynamic(() => import('modules-ui').then((mod) => mod.ModuleChainClaimsCard));

const Claims = () => {
  const { isClient } = useMediaStyles();
  const {
    chainId,
    selectedHat,
    eligibilityRules: rawEligibilityRules,
    isHatDetailsLoading,
    isEligibilityRulesLoading,
  } = useEligibility();
  const communityHat = chainId === 10 && get(selectedHat, 'id') === CONFIG.agreementV0.communityHatId;

  const eligibilityRules = flatten(rawEligibilityRules);
  const activeModule = eligibilityRuleToModuleDetails(first(eligibilityRules));

  const { details, parameters } = useModuleDetails({
    chainId,
    address: get(selectedHat, 'eligibility'),
  });

  if (
    !isClient ||
    isEligibilityRulesLoading ||
    isHatDetailsLoading ||
    !selectedHat?.id ||
    (!activeModule && !communityHat)
  ) {
    return <Skeleton w='full' h='500px' borderRadius='lg' />;
  }

  if (size(eligibilityRules) > 1) {
    // TODO handle multiple modules
    return (
      <div className='flex flex-col gap-4'>
        <ModuleChainClaimButtons />

        <ModuleChainClaimsCard />
      </div>
    );
  }

  if (communityHat || activeModule?.name.includes('Agreement')) {
    return (
      <AgreementClaims
        activeModule={
          activeModule || {
            ...details!,
            instanceAddress: get(selectedHat, 'eligibility'),
            liveParameters: parameters,
          }
        }
      />
    );
  }

  // handle specific modules found
  // TODO migrate to ID and CONSTs
  if (activeModule?.name === 'Hats Election Eligibility') return <ElectionClaims />;
  if (activeModule?.name.includes('Unlock Protocol')) return <SubscriptionClaims />;

  // fallback for other known modules
  if (activeModule) return <SlimModuleDetails type='eligibility' />;

  // fallback for unknown modules
  return (
    <Card>
      <CardBody>
        <Stack>
          <Heading size='xl'>No compatible module found</Heading>
          <Text>
            No compatible module found for hat{' '}
            <Link href={hatLink({ chainId, hatId: selectedHat?.id })} className='decoration'>
              #{hatIdDecimalToIp(BigInt(selectedHat?.id))}
            </Link>{' '}
            on {chainsMap(chainId)?.name}
          </Text>
        </Stack>
      </CardBody>
    </Card>
  );
};

export default Claims;
