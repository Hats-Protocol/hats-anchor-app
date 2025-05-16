import { map } from 'lodash';
import { Skeleton } from 'ui';

export const CouncilHeaderSkeletons = ({ count = 5 }: { count?: number }) => {
  return (
    <div className='mx-auto mt-6 flex max-w-[1400px] flex-col gap-4'>
      {map(Array(count), (_, index) => (
        <Skeleton key={index} className='bg-functional-link-primary/10 h-[125px] w-full' />
      ))}
    </div>
  );
};
