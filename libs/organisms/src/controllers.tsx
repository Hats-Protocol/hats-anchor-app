'use client';

import { useSelectedHat, useTreeForm } from 'contexts';
import { CheckEligibilityForm, EditAndWearers, Eligibility, Toggle } from 'modules-ui';
import { Skeleton } from 'ui';

const Controllers = () => {
  const { isLoading: treeLoading } = useTreeForm();
  const { selectedHat } = useSelectedHat();

  if (treeLoading || !selectedHat) {
    return (
      <div className='flex flex-col gap-2 px-4 md:px-12'>
        <Skeleton className='h-4 w-full md:mx-4' />
        <Skeleton className='h-4 w-full md:mx-4' />
        <Skeleton className='h-4 w-full md:mx-4' />
        <Skeleton className='h-4 w-full md:mx-4' />
      </div>
    );
  }

  return (
    <div className='flex flex-col px-0 md:px-12'>
      <div className='px-4 pb-2 md:px-4'>
        <h2 className='text-md md:text-default font-medium'>Control over this Hat</h2>
      </div>

      <EditAndWearers />

      <Eligibility />

      <Toggle />

      <CheckEligibilityForm />
    </div>
  );
};

export { Controllers };
