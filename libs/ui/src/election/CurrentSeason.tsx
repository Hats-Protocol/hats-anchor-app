import { Heading, Stack } from '@chakra-ui/react';
import { useEligibility } from 'contexts';
import _ from 'lodash';

import DateInfo from './DateInfo';

const CurrentSeason = () => {
  const { moduleParameters } = useEligibility();

  const currentTermEnd = _.find(moduleParameters, {
    label: 'Current Term End',
  });

  let date;
  if (typeof currentTermEnd?.value === 'bigint') {
    date = new Date(Number(currentTermEnd.value) * 1000);
  } else {
    // eslint-disable-next-line no-console
    console.error('Invalid value for currentTermEnd: ', currentTermEnd?.value);
    date = new Date();
  }

  return (
    <Stack gap={4}>
      <Heading size='md'>Current Season</Heading>
      <DateInfo
        date={date}
        // tooltipValue='The end of the current term.'
        label='Term End'
      />
    </Stack>
  );
};

export default CurrentSeason;
