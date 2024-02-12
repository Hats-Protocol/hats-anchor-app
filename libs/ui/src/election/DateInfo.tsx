import { HStack, Text, Tooltip } from '@chakra-ui/react';
import { format, formatDistanceToNow } from 'date-fns';

const DateInfo = ({ date, label }: { date: Date | string; label: string }) => {
  const dateValue = new Date(date);
  const isNotSet = dateValue.getTime() === 0;
  const formattedDate = format(dateValue, 'yyyy-MM-dd HH:mm:ss');
  const timeDistance = formatDistanceToNow(dateValue);

  return (
    <HStack justifyContent='space-between' w='full'>
      <HStack>
        <Text size='sm'>{label}: </Text>
        {/* <Tooltip label={tooltipValue} placement='bottom' shouldWrapChildren>
          <BsQuestionCircle />
        </Tooltip> */}
      </HStack>
      {isNotSet ? (
        <Text size='sm' variant='gray'>
          Not Set
        </Text>
      ) : (
        <Tooltip label={`${formattedDate} UTC`} placement='left'>
          <Text size='sm' variant='medium'>
            {timeDistance} {new Date() > dateValue ? 'ago' : 'from now'}
          </Text>
        </Tooltip>
      )}
    </HStack>
  );
};

export default DateInfo;
