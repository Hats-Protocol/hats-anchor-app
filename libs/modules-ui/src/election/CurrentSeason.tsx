import { Heading, Stack } from '@chakra-ui/react';
import { ModuleParameter } from '@hatsprotocol/modules-sdk';
import { useEligibility } from 'contexts';
import _ from 'lodash';
import { parsedSeconds } from 'utils';

import DateInfo from './DateInfo';

const CurrentSeason = () => {
  const { moduleParameters } = useEligibility();

  const currentTermEnd: ModuleParameter | undefined = _.find(moduleParameters, {
    label: 'Current Term End',
  });

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

export default CurrentSeason;
