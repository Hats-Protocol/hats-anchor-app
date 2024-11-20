'use client';

import { map } from 'lodash';
import Link from 'next/link';

import { useCouncilForm } from '../contexts/council-form';

const STEPS = [
  { id: 'details', label: 'Council Details', sublabel: 'Name your council' },
  {
    id: 'threshold',
    label: 'Signer Threshold',
    sublabel: 'How council members confirm transactions',
  },
  {
    id: 'onboarding',
    label: 'Member Onboarding',
    sublabel: 'Set requirements to join the council',
  },
  {
    id: 'selection',
    label: 'Member Selection',
    sublabel: 'Configure the chosen access modules',
  },
  {
    id: 'finalize',
    label: 'Finalize & Pay',
    sublabel: 'Deploy contracts or save & share configuration',
  },
];

export function CreationFormSteps({
  currentStep,
  draftId,
}: {
  currentStep: string;
  draftId: string;
}) {
  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className='flex flex-col'>
      {map(STEPS, (step, index) => (
        <div key={step.id} className=''>
          <Link href={`/councils/new/${step.id}?draftId=${draftId}`}>
            <div className='flex gap-4'>
              <div className='flex flex-col items-center justify-center'>
                <div
                  className={`z-10 my-3 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white text-lg ${
                    index == currentStepIndex
                      ? 'border-blue-500 bg-blue-100'
                      : 'border-gray-200'
                  }`}
                >
                  {index >= currentStepIndex ? (
                    index + 1
                  ) : (
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='44'
                      height='44'
                      viewBox='0 0 44 44'
                      fill='none'
                      className='h-full w-full'
                    >
                      <path
                        d='M44 22C44 34.1503 34.1503 44 22 44C9.84974 44 0 34.1503 0 22C0 9.84974 9.84974 0 22 0C34.1503 0 44 9.84974 44 22ZM33.0834 13.6666C32.2779 12.8611 30.972 12.8611 30.1666 13.6666C30.1471 13.686 30.1289 13.7066 30.1119 13.7283L20.5628 25.896L14.8057 20.1389C14.0002 19.3334 12.6943 19.3334 11.8888 20.1389C11.0834 20.9443 11.0834 22.2502 11.8888 23.0557L19.1666 30.3334C19.972 31.1389 21.2779 31.1389 22.0834 30.3334C22.1013 30.3155 22.1183 30.2966 22.1341 30.2768L33.1127 16.5535C33.8887 15.746 33.879 14.4622 33.0834 13.6666Z'
                        fill='#2B6CB0'
                      />
                    </svg>
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-7 w-[1px] ${index <= currentStepIndex ? 'bg-blue-500' : 'bg-gray-200'}`}
                  />
                )}
              </div>
              <div className='mt-3 flex flex-col'>
                <h3 className={`text-base font-medium text-gray-900`}>
                  {step.label}
                </h3>
                <p className={`'text-gray-900' text-sm`}>{step.sublabel}</p>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
