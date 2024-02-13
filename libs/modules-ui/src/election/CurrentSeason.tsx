import { Heading, Stack } from '@chakra-ui/react';
import { parsedSeconds } from 'app-utils';
import { useEligibility } from 'contexts';
import _ from 'lodash';

import DateInfo from './DateInfo';

const CurrentSeason = () => {
  const { moduleParameters } = useEligibility();

  const currentTermEnd = _.find(moduleParameters, {
    label: 'Current Term End',
  });

  const date = parsedSeconds(currentTermEnd?.value);

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
