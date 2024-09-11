'use client';

import { Text } from '@chakra-ui/react';
import { useWearersEligibilityStatus } from 'hats-hooks';
import { find, get, includes, toLower, toNumber, toString } from 'lodash';
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

  // TODO fetch contest from JokeRace subgraph
  // TODO fetch contest name from details (subgraph/ipfs?)

  return (
    <EligibilityRule
      rule={
        <Text size={{ base: 'sm', md: 'md' }}>
          {toNumber(topK) > 1 ? `Finish top ${topK}` : 'Finish first'} in the{' '}
          <ChakraNextLink
            href={jokeRaceUrl({ chainId, address: contestAddress })}
            decoration
          >
            JokeRace
          </ChakraNextLink>
        </Text>
      }
      status={
        isEligible ? ELIGIBILITY_STATUS.eligible : ELIGIBILITY_STATUS.ineligible
      }
      displayStatus={isEligible ? 'Selected' : 'Not Selected'}
      icon={isEligible ? BsCheckSquareFill : BsFillXOctagonFill}
    />
  );
};

export default JokeRaceEligibility;
