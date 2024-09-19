'use client';

import { Button, Text } from '@chakra-ui/react';
import { useOverlay } from 'contexts';
import { useWearersEligibilityStatus } from 'hats-hooks';
import { find, get, includes, toLower, toNumber, toString } from 'lodash';
import { JokeRaceModal } from 'modules-ui';
import posthog from 'posthog-js';
import { BsCheckSquareFill, BsFillXOctagonFill } from 'react-icons/bs';
import { SupportedChains } from 'types';
import { ChakraNextLink } from 'ui';
import { jokeRaceUrl, ModuleDetailsHandler } from 'utils';
import { Hex } from 'viem';

import { ELIGIBILITY_STATUS } from '../utils';
import EligibilityRule from './EligibilityRule';

const JokeRaceEligibility = ({
  moduleDetails,
  moduleParameters,
  chainId,
  wearer,
  selectedHat,
}: ModuleDetailsHandler) => {
  const { setModals } = useOverlay();
  const contestAddress = get(
    find(moduleParameters, { displayType: 'jokerace' }),
    'value',
  ) as Hex;
  const topK =
    toString(
      get(
        find(moduleParameters, { label: 'Number Of Elected Hat Wearers' }),
        'value',
      ),
    ) || 'X';

  const wearerIds = wearer ? [toLower(wearer) as Hex] : [];
  const { data: wearerStatus } = useWearersEligibilityStatus({
    selectedHat,
    wearerIds,
    chainId: chainId as SupportedChains,
  });
  const isEligible = includes(get(wearerStatus, 'eligibleWearers'), wearer);

  const eligibilityModalFlag =
    posthog.isFeatureEnabled('eligibility-modal') ||
    process.env.NODE_ENV === 'development';

  // TODO fetch contest from JokeRace subgraph
  // TODO fetch contest name from details (subgraph/ipfs?)
  if (!moduleDetails) return null;

  return (
    <>
      <JokeRaceModal
        eligibilityHatId={selectedHat?.id}
        moduleInfo={moduleDetails}
      />

      <EligibilityRule
        rule={
          <Text>
            {toNumber(topK) > 1 ? `Finish top ${topK}` : 'Finish first'} in the{' '}
            {eligibilityModalFlag ? (
              <Button
                onClick={() => setModals?.({ jokeRaceManager: true })}
                variant='link'
              >
                JokeRace
              </Button>
            ) : (
              <ChakraNextLink
                href={jokeRaceUrl({ chainId, address: contestAddress })}
                decoration
              >
                JokeRace
              </ChakraNextLink>
            )}
          </Text>
        }
        status={
          isEligible
            ? ELIGIBILITY_STATUS.eligible
            : ELIGIBILITY_STATUS.ineligible
        }
        displayStatus={isEligible ? 'Selected' : 'Not Selected'}
        icon={isEligible ? BsCheckSquareFill : BsFillXOctagonFill}
      />
    </>
  );
};

export default JokeRaceEligibility;
