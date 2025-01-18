'use client';

import { Button, Text } from '@chakra-ui/react';
import { useOverlay } from 'contexts';
import { useWearersEligibilityStatus } from 'hats-hooks';
import { get, includes, toLower, toNumber } from 'lodash';
import { useJokeRace } from 'modules-hooks';
import posthog from 'posthog-js';
import { BsCheckSquareFill, BsFillXOctagonFill } from 'react-icons/bs';
import { SupportedChains } from 'types';
import { Link } from 'ui';
import { getJokeRaceModuleParameters, jokeRaceUrl, ModuleDetailsHandler } from 'utils';
import { Hex } from 'viem';

import { ELIGIBILITY_STATUS, EligibilityRuleDetails } from '../eligibility-rules';
import { JokeRaceModal } from './joke-race-modal';

export const JokeRaceEligibilityRule = ({
  moduleDetails,
  moduleParameters,
  chainId,
  wearer,
  selectedHat,
  wearerEligibility,
}: ModuleDetailsHandler) => {
  const { setModals } = useOverlay();

  const { data: currentTerm } = useJokeRace({
    moduleId: moduleDetails?.instanceAddress,
    chainId: chainId as SupportedChains,
  });

  const { contestAddress, topK } = getJokeRaceModuleParameters({
    moduleParameters,
    currentTerm: currentTerm || undefined,
  });

  const wearerIds = wearer ? [toLower(wearer) as Hex] : [];
  const { data: wearerStatus } = useWearersEligibilityStatus({
    selectedHat,
    wearerIds,
    chainId: chainId as SupportedChains,
  });
  const isEligible = includes(get(wearerStatus, 'eligibleWearers'), wearer);

  const eligibilityModalFlag = posthog.isFeatureEnabled('eligibility-modal') || process.env.NODE_ENV === 'development';

  // TODO fetch contest from JokeRace subgraph
  if (!moduleDetails) return null;

  return (
    <>
      <JokeRaceModal
        eligibilityHatId={selectedHat?.id}
        moduleInfo={{ ...moduleDetails, liveParameters: moduleParameters }}
      />

      <EligibilityRuleDetails
        rule={
          <Text>
            {toNumber(topK) > 1 ? `Finish top ${topK}` : 'Finish first'} in the{' '}
            {eligibilityModalFlag ? (
              <Button
                onClick={() =>
                  setModals?.({
                    [`${moduleDetails.instanceAddress}-jokeRaceManager`]: true,
                  })
                }
                variant='link'
              >
                JokeRace
              </Button>
            ) : (
              <Link href={jokeRaceUrl({ chainId, address: contestAddress })} className='underline'>
                JokeRace
              </Link>
            )}
          </Text>
        }
        status={isEligible ? ELIGIBILITY_STATUS.eligible : ELIGIBILITY_STATUS.ineligible}
        displayStatus={isEligible ? 'Selected' : 'Not Selected'}
        icon={isEligible ? BsCheckSquareFill : BsFillXOctagonFill}
      />
    </>
  );
};
