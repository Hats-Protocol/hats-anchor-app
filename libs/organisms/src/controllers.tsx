'use client';

import { useSelectedHat } from 'contexts';
import dynamic from 'next/dynamic';

const CheckEligibilityForm = dynamic(() => import('modules-ui').then((mod) => mod.CheckEligibilityForm));
const EditAndWearers = dynamic(() => import('modules-ui').then((mod) => mod.EditAndWearers));
const Eligibility = dynamic(() => import('modules-ui').then((mod) => mod.Eligibility));
const Toggle = dynamic(() => import('modules-ui').then((mod) => mod.Toggle));

const Controllers = () => {
  const { selectedHat } = useSelectedHat();
  if (selectedHat?.levelAtLocalTree === 0) return null;

  return (
    <div className='flex flex-col px-0 md:px-16'>
      <div className='px-4 md:px-0'>
        <h2 className='text-md md:text-default pb-2 font-medium'>Control over this Hat</h2>
      </div>

      <EditAndWearers />

      <Eligibility />

      <Toggle />

      <CheckEligibilityForm />
    </div>
  );
};

export { Controllers };
