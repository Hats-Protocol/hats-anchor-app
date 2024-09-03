'use client';

import { Text } from '@chakra-ui/react';
import { formatDistanceToNow } from 'date-fns';
import { find, toNumber, toString } from 'lodash';
import { BsCheckSquareFill, BsFillXOctagonFill } from 'react-icons/bs';
import { ModuleDetailsHandler } from 'utils';

import { TOGGLE_STATUS } from '../utils';
import EligibilityRule from './EligibilityRule';

const SeasonToggle = ({
  moduleParameters,
  chainId,
  wearer,
}: ModuleDetailsHandler) => {
  const seasonEnd = find(moduleParameters, { label: 'Season End' });
  const seasonEndDate: number | null = seasonEnd?.value
    ? toNumber(toString((seasonEnd.value as bigint) * BigInt(1000)))
    : null;

  if (!seasonEndDate) {
    return (
      <EligibilityRule
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
      <EligibilityRule
        rule={
          <Text size={{ base: 'sm', md: 'md' }}>
            Hat is active until end of season
          </Text>
        }
        status={TOGGLE_STATUS.active}
        displayStatus={`${formatDistanceToNow(seasonEndDate)} left`}
        icon={BsCheckSquareFill}
      />
    );
  }
  return (
    <EligibilityRule
      rule={
        <Text size={{ base: 'sm', md: 'md' }}>
          Inactive since end of season
        </Text>
      }
      status={TOGGLE_STATUS.inactive}
      displayStatus={`${formatDistanceToNow(seasonEndDate)} ago`}
      icon={BsFillXOctagonFill}
    />
  );
};

export default SeasonToggle;
