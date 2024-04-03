/* eslint-disable import/prefer-default-export */
import { Text } from '@chakra-ui/react';
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

export const handleAgreementEligibility = async ({
  moduleDetails,
  chainId,
  wearer,
  selectedHat,
}: ModuleDetailsHandler): Promise<EligibilityRuleDetails> => {
  const hatId = _.get(selectedHat, 'id', '0');

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
        Sign the{' '}
        <ChakraNextLink
          href={`${CONFIG.CLAIMS_URL}/${chainId}/${hatIdDecimalToIp(
            BigInt(hatId),
          )}`}
          isExternal
          decoration
        >
          Agreement
        </ChakraNextLink>
      </Text>
    ),
    status: isEligible
      ? ELIGIBILITY_STATUS.eligible
      : ELIGIBILITY_STATUS.ineligible,
    displayStatus: isEligible ? 'Signed' : 'Not Signed',
    icon: isEligible ? BsCheckSquareFill : RemovedWearer,
  });
};
