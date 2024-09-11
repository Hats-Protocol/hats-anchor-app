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

const AllowlistEligibility = ({
  chainId,
  wearer,
  selectedHat,
}: ModuleDetailsHandler) => {
  // TODO subgraph will need to index these allowlists specifically, to show the actual lists

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

  if (isEligible) {
    return (
      <EligibilityRule
        rule={<Text size={{ base: 'sm', md: 'md' }}>Be on the Allowlist</Text>}
        status={ELIGIBILITY_STATUS.eligible}
        displayStatus='Allowed'
        icon={BsCheckSquareFill}
      />
    );
  }

  return (
    <EligibilityRule
      rule={<Text size={{ base: 'sm', md: 'md' }}>Be on the Allowlist</Text>}
      status={ELIGIBILITY_STATUS.ineligible}
      displayStatus='Not allowed'
      icon={BsFillXOctagonFill} // {EmptyWearer}
    />
  );
};

export default AllowlistEligibility;
