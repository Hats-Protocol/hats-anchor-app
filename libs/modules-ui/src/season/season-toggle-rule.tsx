'use client';

import { formatDistanceToNow } from 'date-fns';
import { find, toNumber, toString } from 'lodash';
import { BsCheckSquareFill, BsFillXOctagonFill } from 'react-icons/bs';
import { ModuleDetailsHandler } from 'utils';

import { EligibilityRuleDetails, TOGGLE_STATUS } from '../eligibility-rules';

export const SeasonToggleRule = ({ moduleParameters, chainId, wearer }: ModuleDetailsHandler) => {
  const seasonEnd = find(moduleParameters, { label: 'Season End' });
  const seasonEndDate: number | null = seasonEnd?.value
    ? toNumber(toString((seasonEnd.value as bigint) * BigInt(1000)))
    : null;

  if (!seasonEndDate) {
    return (
      <EligibilityRuleDetails
        rule={undefined}
        status={TOGGLE_STATUS.inactive}
        displayStatus='No season end date'
        displayStatusLink=''
        icon={BsFillXOctagonFill}
      />
    );
  }

  if (seasonEndDate > Date.now()) {
    return (
      <EligibilityRuleDetails
        rule={<p>Hat is active until end of season</p>}
        status={TOGGLE_STATUS.active}
        displayStatus={`${formatDistanceToNow(seasonEndDate)} left`}
        icon={BsCheckSquareFill}
      />
    );
  }
  return (
    <EligibilityRuleDetails
      rule={<p>Inactive since end of season</p>}
      status={TOGGLE_STATUS.inactive}
      displayStatus={`${formatDistanceToNow(seasonEndDate)} ago`}
      icon={BsFillXOctagonFill}
    />
  );
};
