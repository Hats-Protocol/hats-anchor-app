import { format, formatDistanceToNow } from 'date-fns';
import { Tooltip } from 'ui';

export const DateInfo = ({ date, label }: { date: Date | string | undefined; label: string }) => {
  let dateValue: Date | undefined;

  if (date) {
    dateValue = new Date(date);
  }
  const formattedDate = dateValue && format(dateValue, 'yyyy-MM-dd HH:mm:ss');
  const timeDistance = dateValue && formatDistanceToNow(dateValue);

  return (
    <div className='flex w-full justify-between'>
      <div>
        <p className='text-sm'>{label}: </p>
        {/* <Tooltip label={tooltipValue} placement='bottom' shouldWrapChildren>
          <BsQuestionCircle />
        </Tooltip> */}
      </div>

      {timeDistance && dateValue ? (
        <Tooltip label={`${formattedDate} UTC`}>
          <p className='text-sm'>
            {timeDistance} {new Date() > dateValue ? 'ago' : 'from now'}
          </p>
        </Tooltip>
      ) : (
        <p className='text-sm text-gray-500'>Not Set</p>
      )}
    </div>
  );
};
