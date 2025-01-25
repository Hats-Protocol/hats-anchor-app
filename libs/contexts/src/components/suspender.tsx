'use client';

import { Skeleton } from 'ui';

const Suspender = () => {
  return (
    <div className='flex h-full w-full items-center justify-center'>
      <Skeleton className='h-full w-full' />
    </div>
  );
};

export { Suspender };
