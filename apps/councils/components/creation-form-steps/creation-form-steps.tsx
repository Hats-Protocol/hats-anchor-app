'use client';

import { map } from 'lodash';

const STEPS = [
  { step: 0, label: 'Create Council', sublabel: 'Name your council' },
  { step: 1, label: 'Member Selection', sublabel: 'How council members join' },
];

export function CreationFormSteps() {
  return (
    <div className='flex flex-col gap-10'>
      {map(STEPS, (step) => (
        <div className='flex gap-2' key={step.label}>
          <img
            src='/icon.jpeg'
            alt='check mark icon'
            className='h-20 w-20 rounded-full'
          />

          <div className='flex flex-col justify-center'>
            <h3 className='text-xl font-medium'>{step.label}</h3>
            <p className='text-lg'>{step.sublabel}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
