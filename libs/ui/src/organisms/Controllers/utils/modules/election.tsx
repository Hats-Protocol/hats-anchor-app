/* eslint-disable import/prefer-default-export */
import { CONFIG } from '@hatsprotocol/constants';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { BsCheckSquareFill } from 'react-icons/bs';
import { fallbackModuleCheck, ModuleDetailsHandler } from 'utils';

import ChakraNextLink from '../../../../atoms/ChakraNextLink';
import { ELIGIBILITY_STATUS, EligibilityRuleDetails } from '../general';

const RemovedWearer = dynamic(() =>
  import('icons').then((i) => i.RemovedWearer),
);

export const handleElectionEligibility = async ({
  moduleDetails,
  chainId,
  wearer,
  selectedHat,
}: ModuleDetailsHandler): Promise<EligibilityRuleDetails> => {
  const result = await fallbackModuleCheck({
    moduleDetails,
    chainId,
    wearer,
    selectedHat,
  });
  const isEligible =
    _.get(result, 'eligible', false) && _.get(result, 'standing', false);
  const hatId = _.get(selectedHat, 'id', '0');

  return Promise.resolve({
    rule: (
      <ChakraNextLink
        href={`${CONFIG.CLAIMS_URL}/${chainId}/${hatIdDecimalToIp(
          BigInt(hatId),
        )}`}
        decoration
      >
        Be elected by voters
      </ChakraNextLink>
    ),
    status: isEligible
      ? ELIGIBILITY_STATUS.eligible
      : ELIGIBILITY_STATUS.ineligible,
    displayStatus: isEligible ? 'Elected' : 'Not Elected',
    icon: isEligible ? BsCheckSquareFill : RemovedWearer,
  });
};
