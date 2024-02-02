import { HStack, Stack, Text, Tooltip } from '@chakra-ui/react';
import { format, formatDistanceToNow } from 'date-fns';
import _ from 'lodash';
import React from 'react';
import { BsQuestionCircle } from 'react-icons/bs';

import { useEligibility } from '../../contexts/EligibilityContext';

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
    <Stack>
      <Text fontWeight='bold'>Current Season</Text>
      <HStack justifyContent='space-between'>
        <HStack>
          <Text>Term End</Text>
          <Tooltip
            label='The end of the current term.'
            placement='bottom'
            shouldWrapChildren
          >
            <BsQuestionCircle />
          </Tooltip>
        </HStack>
        {currentTermEnd && currentTermEnd.value === BigInt(0) ? (
          <Text fontSize='sm' color='gray.500'>
            Not Set
          </Text>
        ) : (
          currentTermEnd && (
            <Tooltip
              label={`${format(date, 'yyyy-MM-dd HH:mm:ss')} UTC`}
              placement='left'
            >
              <Text fontSize='sm' color='gray.500'>
                {formatDistanceToNow(date)}{' '}
                {new Date() > date ? 'ago' : 'from now'}
              </Text>
            </Tooltip>
          )
        )}
      </HStack>
    </Stack>
  );
};

export default CurrentSeason;
