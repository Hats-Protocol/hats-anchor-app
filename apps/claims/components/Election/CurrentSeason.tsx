import { Stack, Text } from '@chakra-ui/react';
import _ from 'lodash';
import React from 'react';

import { useEligibility } from '../../contexts/EligibilityContext';
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
    console.error('Invalid value for currentTermEnd: ', currentTermEnd?.value);
    date = new Date();
  }

  return (
    <Stack gap={4}>
      <Text fontWeight='bold'>Current Season</Text>
      <DateInfo
        date={date}
        // tooltipValue='The end of the current term.'
        label='Term End'
      />
    </Stack>
  );
};

export default CurrentSeason;
