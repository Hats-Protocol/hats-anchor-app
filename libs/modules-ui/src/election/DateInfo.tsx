import { HStack, Text, Tooltip } from '@chakra-ui/react';
import { format, formatDistanceToNow } from 'date-fns';

const DateInfo = ({
  date,
  label,
}: {
  date: Date | string | undefined;
  label: string;
}) => {
  let dateValue: Date | undefined;

  if (date) {
    dateValue = new Date(date);
  }
  const formattedDate = dateValue && format(dateValue, 'yyyy-MM-dd HH:mm:ss');
  const timeDistance = dateValue && formatDistanceToNow(dateValue);

  return (
    <HStack justifyContent='space-between' w='full'>
      <HStack>
        <Text size='sm'>{label}: </Text>
        {/* <Tooltip label={tooltipValue} placement='bottom' shouldWrapChildren>
          <BsQuestionCircle />
        </Tooltip> */}
      </HStack>
      {timeDistance && dateValue ? (
        <Tooltip label={`${formattedDate} UTC`} placement='left'>
          <Text size='sm' variant='medium'>
            {timeDistance} {new Date() > dateValue ? 'ago' : 'from now'}
          </Text>
        </Tooltip>
      ) : (
        <Text size='sm' variant='gray'>
          Not Set
        </Text>
      )}
    </HStack>
  );
};

export default DateInfo;
