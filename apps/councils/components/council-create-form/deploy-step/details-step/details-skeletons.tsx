import { Skeleton } from 'ui';

export const LoadingDetailsStep = () => {
  return (
    <div className='flex h-full flex-col space-y-6'>
      <div className='flex-1 space-y-6'>
        <Skeleton className='h-8 w-48' /> {/* Title skeleton */}
        <div className='space-y-2'>
          <Skeleton className='h-5 w-36' /> {/* Organization Name label */}
          <Skeleton className='h-4 w-64' /> {/* Organization Name sublabel */}
          <Skeleton className='h-10 w-full rounded-lg' /> {/* Organization Name select */}
        </div>
        <div className='space-y-2'>
          <Skeleton className='h-5 w-32' /> {/* Chain label */}
          <Skeleton className='h-4 w-96' /> {/* Chain sublabel */}
          <Skeleton className='h-10 w-full rounded-lg' /> {/* Chain select */}
        </div>
        <div className='space-y-2'>
          <Skeleton className='h-5 w-28' /> {/* Council Name label */}
          <Skeleton className='h-4 w-80' /> {/* Council Name sublabel */}
          <Skeleton className='h-10 w-full rounded-lg' /> {/* Council Name input */}
        </div>
        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            <Skeleton className='h-5 w-40' /> {/* Description label */}
            <Skeleton className='h-4 w-16' /> {/* Optional text */}
          </div>
          <Skeleton className='h-4 w-96' /> {/* Description sublabel */}
          <Skeleton className='h-24 w-full rounded-lg' /> {/* Description textarea */}
        </div>
      </div>

      <div className='flex justify-end py-6'>
        <Skeleton className='h-10 w-32 rounded-full' /> {/* Next button */}
      </div>
    </div>
  );
};
