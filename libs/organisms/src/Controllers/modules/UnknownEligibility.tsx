'use client';

import { Text } from '@chakra-ui/react';
import { useWearersEligibilityStatus } from 'hats-hooks';
import { get, includes, toLower } from 'lodash';
import { BsCheckSquareFill, BsFillXOctagonFill } from 'react-icons/bs';
import { SupportedChains } from 'types';
import { ModuleDetailsHandler } from 'utils';
import { Hex } from 'viem';

import { ELIGIBILITY_STATUS } from '../utils';
import EligibilityRule from './EligibilityRule';

const UnknownEligibility = ({
  chainId,
  wearer,
  selectedHat,
}: ModuleDetailsHandler) => {
  const wearerIds = wearer ? [toLower(wearer) as Hex] : [];
  const { data: wearerStatus } = useWearersEligibilityStatus({
    selectedHat,
    wearerIds,
    chainId: chainId as SupportedChains,
  });
  const isEligible = includes(
    get(wearerStatus, 'eligibleWearers'),
    toLower(wearer),
  );

  return (
    <EligibilityRule
      rule={<Text>Comply with 1 eligibility rule</Text>}
      status={
        isEligible ? ELIGIBILITY_STATUS.eligible : ELIGIBILITY_STATUS.ineligible
      }
      displayStatus={isEligible ? 'Eligible' : 'Ineligible'}
      icon={isEligible ? BsCheckSquareFill : BsFillXOctagonFill}
    />
  );
};

export default UnknownEligibility;
