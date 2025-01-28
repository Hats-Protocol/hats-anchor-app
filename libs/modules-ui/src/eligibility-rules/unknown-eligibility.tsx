'use client';

import { useWearersEligibilityStatus } from 'hats-hooks';
import { get, includes, toLower } from 'lodash';
import { BsCheckSquareFill, BsFillXOctagonFill } from 'react-icons/bs';
import { SupportedChains } from 'types';
import { ModuleDetailsHandler } from 'utils';
import { Hex } from 'viem';

import { EligibilityRuleDetails } from './eligibility-rule-details';
import { ELIGIBILITY_STATUS } from './utils';

export const UnknownEligibilityRule = ({ chainId, wearer, selectedHat }: ModuleDetailsHandler) => {
  const wearerIds = wearer ? [toLower(wearer) as Hex] : [];
  const { data: wearerStatus } = useWearersEligibilityStatus({
    selectedHat,
    wearerIds,
    chainId: chainId as SupportedChains,
  });
  const isEligible = includes(get(wearerStatus, 'eligibleWearers'), toLower(wearer));

  let status = ELIGIBILITY_STATUS.ineligible;
  let displayStatus = 'Ineligible';
  let icon = BsFillXOctagonFill;

  if (isEligible) {
    status = ELIGIBILITY_STATUS.eligible;
    displayStatus = 'Eligible';
    icon = BsCheckSquareFill;
  }

  return (
    <EligibilityRuleDetails
      rule={<p>Comply with 1 eligibility rule</p>}
      status={status}
      displayStatus={displayStatus}
      icon={icon}
    />
  );
};
