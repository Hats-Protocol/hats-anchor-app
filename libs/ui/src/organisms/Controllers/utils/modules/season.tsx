/* eslint-disable import/prefer-default-export */
import { Text } from '@chakra-ui/react';
import { formatDistanceToNow } from 'date-fns';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { BsCheckSquareFill } from 'react-icons/bs';
import { ModuleDetailsHandler } from 'utils';

import { TOGGLE_STATUS, ToggleRuleDetails } from '../general';

const RemovedWearer = dynamic(() =>
  import('icons').then((i) => i.RemovedWearer),
);

export const handleSeasonToggle = ({
  moduleParameters,
  chainId,
  wearer,
}: ModuleDetailsHandler): Promise<ToggleRuleDetails> => {
  const seasonEnd = _.find(moduleParameters, { label: 'Season End' });
  const seasonEndDate: number = _.toNumber(
    _.toString((seasonEnd?.value as bigint) * BigInt(1000)),
  );

  if (seasonEndDate > Date.now()) {
    return Promise.resolve({
      rule: (
        <Text size={{ base: 'sm', md: 'md' }}>
          Hat is active until end of season
        </Text>
      ),
      status: TOGGLE_STATUS.active,
      displayStatus: `${formatDistanceToNow(seasonEndDate)} left`,
      icon: BsCheckSquareFill,
    });
  }
  return Promise.resolve({
    rule: (
      <Text size={{ base: 'sm', md: 'md' }}>Inactive since end of season</Text>
    ),
    status: TOGGLE_STATUS.inactive,
    displayStatus: `${formatDistanceToNow(seasonEndDate)} ago`,
    icon: RemovedWearer,
  });
};
