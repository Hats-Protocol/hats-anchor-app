'use client';

import { Heading, Stack } from '@chakra-ui/react';
import { ModuleParameter } from '@hatsprotocol/modules-sdk';
import { useEligibility } from 'contexts';
import { find, get } from 'lodash';
import { eligibilityRuleToModuleDetails, parsedSeconds } from 'utils';

import { DateInfo } from './date-info';

export const CurrentSeason = () => {
  const { activeRule } = useEligibility();
  const moduleDetails = eligibilityRuleToModuleDetails(activeRule);

  const currentTermEnd: ModuleParameter | undefined = find(
    get(moduleDetails, 'liveParameters'),
    {
      label: 'Current Term End',
    },
  );

  const date = parsedSeconds(currentTermEnd?.value as bigint);

  if (!date) return null;

  return (
    <Stack gap={4}>
      <Heading size='md'>Current Season</Heading>
      <DateInfo
        date={date}
        // tooltipValue='The end of the current term.'
        label='Season End'
      />
    </Stack>
  );
};
