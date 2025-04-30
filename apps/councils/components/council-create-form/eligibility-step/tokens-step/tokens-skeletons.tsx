import { Skeleton } from 'ui';

export const RadioCardSkeleton = () => (
  <div className='flex cursor-pointer rounded-lg border border-gray-200 px-6 py-4'>
    <div className='flex w-full items-center gap-3'>
      <Skeleton className='h-4 w-4 rounded-full' />
      <div className='flex w-full items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Skeleton className='h-6 w-6' />
          <div className='space-y-2'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-3 w-64' />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const LoadingTokensStep = () => (
  <div className='mx-auto flex w-full flex-col space-y-8'>
    {/* Header */}
    <div className='space-y-2'>
      <div className='flex items-center gap-3'>
        <Skeleton className='h-6 w-6' />
        <Skeleton className='h-8 w-48' />
      </div>
    </div>

    {/* Token Requirement Selection */}
    <div className='space-y-4'>
      <div className='flex flex-col gap-1'>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-6 w-64' />
        </div>
      </div>
      <div className='flex flex-col gap-4'>
        <RadioCardSkeleton />
        <RadioCardSkeleton />
      </div>
    </div>

    {/* Token Input Fields */}
    <div className='grid grid-cols-2 gap-8'>
      <div className='w-full space-y-2'>
        <Skeleton className='h-6 w-24' />
        <Skeleton className='h-10 w-full' />
      </div>
      <div className='w-full space-y-2'>
        <Skeleton className='h-6 w-24' />
        <Skeleton className='h-10 w-full' />
      </div>
    </div>

    {/* Next Button */}
    <div className='flex justify-end py-6'>
      <Skeleton className='h-10 w-32' />
    </div>
  </div>
);
