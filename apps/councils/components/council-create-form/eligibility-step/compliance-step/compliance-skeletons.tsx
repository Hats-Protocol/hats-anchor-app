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
        <div className='flex -space-x-2'>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className='h-6 w-6 rounded-full' />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const LoadingComplianceStep = () => (
  <div className='mx-auto flex w-full flex-col space-y-6'>
    {/* Header */}
    <div className='flex items-center gap-4'>
      <Skeleton className='h-6 w-6' />
      <Skeleton className='h-8 w-64' />
    </div>

    {/* Description */}
    <div>
      <Skeleton className='h-4 w-full max-w-2xl' />
    </div>

    {/* Compliance Manager Selection */}
    <div className='space-y-8'>
      <div className='space-y-2'>
        <Skeleton className='h-6 w-48' />
        <div className='flex flex-col gap-4'>
          <RadioCardSkeleton />
          <RadioCardSkeleton />
          <RadioCardSkeleton />
        </div>
      </div>

      {/* Compliance Managers List Section */}
      <div>
        <Skeleton className='mb-2 h-6 w-48' />
        <Skeleton className='h-4 w-96' />
        <div className='mt-4 space-y-4'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <Skeleton className='h-10 w-10 rounded-full' />
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-32' />
                  <Skeleton className='h-3 w-24' />
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <Skeleton className='h-10 w-20 rounded-full' />
                <Skeleton className='h-10 w-10 rounded-full' />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Next Button */}
    <div className='flex justify-end py-6'>
      <Skeleton className='h-10 w-32' />
    </div>
  </div>
);
