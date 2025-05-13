'use client';

import { useOverlay } from 'contexts';
// import { truncate } from 'lodash';
import { CircleAlert, TriangleAlert } from 'lucide-react';
import { cn } from 'ui';

// const getErrorMessage = (error: Error | undefined) => {
//   if (!error) return '';
//   return error.message;
// };

export const Banner = () => {
  const { banner } = useOverlay();

  if (!banner) return null;

  // const errorMessage = getErrorMessage(banner.error);

  let Icon = <></>;

  if (banner.variant === 'error') {
    Icon = <TriangleAlert className='h-6 w-6' />;
  }
  if (!banner.variant || banner.variant === 'info') {
    Icon = <CircleAlert className='h-6 w-6' />;
  }

  return (
    <div
      className={cn('flex h-12 w-full items-center px-4', banner.variant === 'error' ? 'bg-red-900' : 'bg-gray-800')}
    >
      <div className='flex items-center gap-4 text-white'>
        {Icon}
        <p className='font-medium'>Services Temporarily Unavailable</p>
        <p className='text-white/80'>{banner.message}</p>
        {/* {errorMessage && <p className='text-sm text-gray-400'>{truncate(errorMessage, { length: 100 })}</p>} */}
      </div>
    </div>
  );
};
