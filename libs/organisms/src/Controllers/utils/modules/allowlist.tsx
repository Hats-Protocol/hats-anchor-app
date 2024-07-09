'use client';

/* eslint-disable import/prefer-default-export */
import { Text } from '@chakra-ui/react';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { BsCheckSquareFill } from 'react-icons/bs';
import { fallbackModuleCheck, ModuleDetailsHandler } from 'utils';

import { ELIGIBILITY_STATUS, EligibilityRuleDetails } from '../general';

const EmptyWearer = dynamic(() => import('icons').then((i) => i.EmptyWearer));

export const handleAllowlistEligibility = async ({
  moduleDetails,
  moduleParameters,
  chainId,
  wearer,
  selectedHat,
}: ModuleDetailsHandler): Promise<EligibilityRuleDetails> => {
  // TODO subgraph will need to index these allowlists specifically, to show the actual lists

  const result = await fallbackModuleCheck({
    moduleDetails,
    chainId,
    wearer,
    selectedHat,
  });
  const isEligible =
    _.get(result, 'eligible', false) && _.get(result, 'standing', false);

  if (isEligible) {
    return Promise.resolve({
      rule: <Text size={{ base: 'sm', md: 'md' }}>Be on the Allowlist</Text>,
      status: ELIGIBILITY_STATUS.eligible,
      displayStatus: 'Allowed',
      icon: BsCheckSquareFill,
    });
  }

  return Promise.resolve({
    rule: <Text size={{ base: 'sm', md: 'md' }}>Be on the Allowlist</Text>,
    status: ELIGIBILITY_STATUS.ineligible,
    displayStatus: 'Not allowed',
    icon: EmptyWearer,
  });
};
