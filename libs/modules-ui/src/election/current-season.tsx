'use client';

import { ModuleParameter } from '@hatsprotocol/modules-sdk';
import { useEligibility } from 'contexts';
import { find, get } from 'lodash';
import { eligibilityRuleToModuleDetails, parsedSeconds } from 'utils';

import { DateInfo } from './date-info';

export const CurrentSeason = () => {
  const { activeRule } = useEligibility();
  const moduleDetails = eligibilityRuleToModuleDetails(activeRule);

  const currentTermEnd: ModuleParameter | undefined = find(get(moduleDetails, 'liveParameters'), {
    label: 'Current Term End',
  });

  const date = parsedSeconds(currentTermEnd?.value as bigint);

  if (!date) return null;

  return (
    <div className='flex flex-col gap-4'>
      <h3 className='text-lg font-semibold'>Current Season</h3>
      <DateInfo
        date={date}
        // tooltipValue='The end of the current term.'
        label='Season End'
      />
    </div>
  );
};
