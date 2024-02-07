import { HStack, Text, Tooltip, useTheme } from '@chakra-ui/react';
import { format, formatDistanceToNow } from 'date-fns';
import React from 'react';

const DateInfo = ({ date, label }: { date: Date | string; label: string }) => {
  const dateValue = new Date(date);
  const isNotSet = dateValue.getTime() === 0;
  const formattedDate = format(dateValue, 'yyyy-MM-dd HH:mm:ss');
  const timeDistance = formatDistanceToNow(dateValue);
  const theme = useTheme();
  console.log(theme);

  return (
    <HStack justifyContent='space-between' w='full'>
      <HStack>
        <Text fontSize='sm'>{label}: </Text>
        {/* <Tooltip label={tooltipValue} placement='bottom' shouldWrapChildren>
          <BsQuestionCircle />
        </Tooltip> */}
      </HStack>
      {isNotSet ? (
        <Text fontSize='sm' color='gray.500'>
          Not Set
        </Text>
      ) : (
        <Tooltip label={`${formattedDate} UTC`} placement='left'>
          <Text fontSize='sm' variant='medium'>
            {timeDistance} {new Date() > dateValue ? 'ago' : 'from now'}
          </Text>
        </Tooltip>
      )}
    </HStack>
  );
};

export default DateInfo;
