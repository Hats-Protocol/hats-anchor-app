/* eslint-disable import/prefer-default-export */
import { Text } from '@chakra-ui/react';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { BsCheckSquareFill } from 'react-icons/bs';
import { fallbackModuleCheck, jokeRaceUrl, ModuleDetailsHandler } from 'utils';
import { Hex } from 'viem';

import { ChakraNextLink } from '../../../../atoms';
import { ELIGIBILITY_STATUS, EligibilityRuleDetails } from '../general';

const RemovedWearer = dynamic(() =>
  import('icons').then((i) => i.RemovedWearer),
);

export const handleJokeRaceEligibility = async ({
  moduleDetails,
  moduleParameters,
  chainId,
  wearer,
  selectedHat,
}: ModuleDetailsHandler): Promise<EligibilityRuleDetails> => {
  const contestAddress = _.get(
    _.find(moduleParameters, { displayType: 'jokerace' }),
    'value',
  ) as Hex;
  const topK =
    _.toString(
      _.get(
        _.find(moduleParameters, { label: 'Number Of Elected Hat Wearers' }),
        'value',
      ),
    ) || 'X';

  // TODO fetch contest from JokeRace subgraph
  // TODO fetch contest name from details (subgraph/ipfs?)
  const result = await fallbackModuleCheck({
    moduleDetails,
    chainId,
    wearer,
    selectedHat,
  });
  const isEligible =
    _.get(result, 'eligible', false) && _.get(result, 'standing', false);

  return Promise.resolve({
    rule: (
      <Text>
        Finish top {topK} in the{' '}
        <ChakraNextLink
          href={jokeRaceUrl({ chainId, address: contestAddress })}
          decoration
        >
          JokeRace
        </ChakraNextLink>
      </Text>
    ),
    status: isEligible
      ? ELIGIBILITY_STATUS.eligible
      : ELIGIBILITY_STATUS.ineligible,
    displayStatus: isEligible ? 'Selected' : 'Not Selected',
    icon: isEligible ? BsCheckSquareFill : RemovedWearer,
  });
};
