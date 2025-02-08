'use client';

import { useCouncilForm } from 'contexts';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import type { StepValidation } from 'types';
import { cn } from 'ui';
import { logger } from 'utils';

interface Step {
  id: keyof StepValidation;
  label: string;
  sublabel?: string;
  subSteps?: Array<{ id: string; label: string }>;
}

const BASE_STEPS: Step[] = [
  {
    id: 'details',
    label: 'Council Details',
    sublabel: 'Name your council',
  },
  {
    id: 'threshold',
    label: 'Signer Threshold',
    sublabel: 'How council members confirm transactions',
  },
  {
    id: 'onboarding',
    label: 'Council Membership',
    sublabel: 'Set requirements to join the council',
  },
  {
    id: 'selection',
    label: 'Council Roles',
    sublabel: 'Council Members & Managers',
    subSteps: [],
  },
  {
    id: 'payment',
    label: 'Subscribe & Deploy',
    sublabel: 'Add payment details and deploy onchain',
  },
];

// Helper function to get step summary
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getStepSummary(step: Step, form: UseFormReturn<any>, stepValidation: StepValidation) {
  // If step is not valid, show sublabel
  if (!getStepValidation(step, stepValidation, form.watch('requirements'))) {
    return step.sublabel;
  }

  // If step is valid, show summary
  switch (step.id) {
    case 'details':
      return `${form.watch('councilName')}`;
    case 'threshold':
      const thresholdType = form.watch('thresholdType');
      if (thresholdType === 'ABSOLUTE') {
        return `${form.watch('min')} out of ${form.watch('maxMembers')} members`;
      } else {
        return `${form.watch('target')}% of members`;
      }
    case 'onboarding':
      const requirements = form.watch('requirements');
      const reqs = [];
      if (requirements?.signAgreement) reqs.push('Agreement');
      if (requirements?.holdTokens) reqs.push('Tokens');
      if (requirements?.passCompliance) reqs.push('Compliance');
      return reqs.length ? reqs.join(' • ') : 'No requirements';
    case 'selection':
      const memberCount = form.watch('members')?.length || 0;
      const adminCount = form.watch('admins')?.length || 0;
      return `${memberCount} council members & ${adminCount} managers`;
    default:
      return step.sublabel;
  }
}

interface CreationFormStepsProps {
  currentStep: string;
  currentSubStep?: string;
  draftId: string;
}

function getSubStepStatus(subStepId: string, currentSubStep: string | undefined, stepValidation: StepValidation) {
  const isValid = stepValidation.selectionSubSteps[subStepId as keyof typeof stepValidation.selectionSubSteps];
  if (isValid) {
    return 'completed';
  }
  return subStepId === currentSubStep ? 'current' : 'upcoming';
}

function isSelectionStepValid(stepValidation: StepValidation, requirements: any) {
  const activeSubSteps = [
    'members',
    'management',
    ...(requirements?.signAgreement ? ['agreement'] : []),
    ...(requirements?.holdTokens ? ['tokens'] : []),
    ...(requirements?.passCompliance ? ['compliance'] : []),
  ];

  return activeSubSteps.every(
    (subStep) => stepValidation.selectionSubSteps[subStep as keyof typeof stepValidation.selectionSubSteps],
  );
}

function getStepValidation(step: Step, stepValidation: StepValidation, requirements: any) {
  if (step.id === 'selection') {
    return isSelectionStepValid(stepValidation, requirements);
  }
  return stepValidation[step.id];
}

function CreationFormSteps({ currentStep, currentSubStep, draftId }: CreationFormStepsProps) {
  const { form, stepValidation } = useCouncilForm();
  const router = useRouter();
  const requirements = form.watch('requirements');

  const STEPS = [...BASE_STEPS];
  const selectionStep = STEPS.find((step) => step.id === 'selection');
  if (selectionStep) {
    selectionStep.subSteps = [
      { id: 'management', label: 'Council Management' },
      ...(requirements?.signAgreement ? [{ id: 'agreement', label: 'Agreement' }] : []),
      ...(requirements?.holdTokens ? [{ id: 'tokens', label: 'Token Requirements' }] : []),
      ...(requirements?.passCompliance ? [{ id: 'compliance', label: 'Compliance Check' }] : []),
      { id: 'members', label: 'Council Members' },
    ];
  }

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

  const [isNavigating, setIsNavigating] = useState(false);

  const handleStepNavigation = useCallback(
    async (targetStep: string, targetSubStep?: string) => {
      try {
        setIsNavigating(true);
        // await persistForm(currentStep, currentSubStep);

        if (targetStep === 'selection') {
          router.push(`/councils/new/${targetStep}?subStep=${targetSubStep || 'management'}&draftId=${draftId}`);
        } else {
          router.push(`/councils/new/${targetStep}?draftId=${draftId}`);
        }
      } catch (error) {
        logger.error('Failed to save step data:', error);
        // Add error notification here
      } finally {
        setIsNavigating(false);
      }
    },
    [router, draftId],
  );

  return (
    <div className='flex flex-col'>
      {STEPS.map((step, index) => (
        <div key={step.id}>
          <button
            onClick={() => handleStepNavigation(step.id)}
            /*disabled={isNavigating}*/
            className='w-full text-left disabled:opacity-50'
          >
            <div className='flex gap-4'>
              <div className='flex flex-col items-center'>
                {/* Main step circle */}
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full shadow-sm',
                    getStepValidation(step, stepValidation, requirements)
                      ? 'bg-white shadow-sm'
                      : 'border-2 border-gray-200',
                    index === currentStepIndex && 'border-functional-link-primary bg-sky-100',
                  )}
                >
                  {getStepValidation(step, stepValidation, requirements) ? (
                    <svg
                      width='44'
                      height='44'
                      viewBox='0 0 44 44'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-12 w-12 text-white'
                    >
                      <g id='check-circle-fill'>
                        <path
                          id='Subtract'
                          d='M44 22C44 34.1503 34.1503 44 22 44C9.84974 44 0 34.1503 0 22C0 9.84974 9.84974 0 22 0C34.1503 0 44 9.84974 44 22ZM33.0834 13.6666C32.2779 12.8611 30.972 12.8611 30.1666 13.6666C30.1471 13.686 30.1289 13.7066 30.1119 13.7283L20.5628 25.896L14.8057 20.1389C14.0002 19.3334 12.6943 19.3334 11.8888 20.1389C11.0834 20.9443 11.0834 22.2502 11.8888 23.0557L19.1666 30.3334C19.972 31.1389 21.2779 31.1389 22.0834 30.3334C22.1013 30.3155 22.1183 30.2966 22.1341 30.2768L33.1127 16.5535C33.8887 15.746 33.879 14.4622 33.0834 13.6666Z'
                          fill='#2B6CB0'
                        />
                      </g>
                    </svg>
                  ) : (
                    <span className='text-lg text-black'>{index + 1}</span>
                  )}
                </div>

                {/* Vertical line */}
                {step.id === 'payment' || (step.id === 'selection' && currentStep === 'selection') ? null : (
                  <div
                    className={`my-3 h-12 w-[2px] ${
                      getStepValidation(step, stepValidation, requirements)
                        ? 'bg-functional-link-primary'
                        : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>

              <div className=''>
                <span className='text-base font-medium text-gray-900'>{step.label}</span>
                <span className='block text-sm text-gray-500'>{getStepSummary(step, form, stepValidation)}</span>
              </div>
            </div>
          </button>

          {/* Sub-steps */}
          {currentStep === 'selection' && step.id === 'selection' && step.subSteps && (
            <div className='my-3 ml-[23px]'>
              {step.subSteps.map((subStep, subIndex) => {
                const status = getSubStepStatus(subStep.id, currentSubStep, stepValidation);
                return (
                  <button
                    key={subStep.id}
                    onClick={() => handleStepNavigation('selection', subStep.id)}
                    className={`flex w-full items-center gap-3 border-l-[2px] ${
                      status === 'completed' ? 'border-l-functional-link-primary' : 'border-l-gray-200'
                    }`}
                  >
                    <div
                      className={`my-1 ml-4 flex h-6 w-6 items-center justify-center rounded-full ${
                        status === 'current'
                          ? 'border-functional-link-primary bg-functional-link-primary/10 border'
                          : 'border border-gray-200 bg-white'
                      }`}
                    >
                      {status === 'completed' ? (
                        <svg
                          width='44'
                          height='44'
                          viewBox='0 0 44 44'
                          fill='none'
                          xmlns='http://www.w3.org/2000/svg'
                          className='text-white'
                        >
                          <g id='check-circle-fill'>
                            <path
                              id='Subtract'
                              d='M44 22C44 34.1503 34.1503 44 22 44C9.84974 44 0 34.1503 0 22C0 9.84974 9.84974 0 22 0C34.1503 0 44 9.84974 44 22ZM33.0834 13.6666C32.2779 12.8611 30.972 12.8611 30.1666 13.6666C30.1471 13.686 30.1289 13.7066 30.1119 13.7283L20.5628 25.896L14.8057 20.1389C14.0002 19.3334 12.6943 19.3334 11.8888 20.1389C11.0834 20.9443 11.0834 22.2502 11.8888 23.0557L19.1666 30.3334C19.972 31.1389 21.2779 31.1389 22.0834 30.3334C22.1013 30.3155 22.1183 30.2966 22.1341 30.2768L33.1127 16.5535C33.8887 15.746 33.879 14.4622 33.0834 13.6666Z'
                              fill='#2B6CB0'
                            />
                          </g>
                        </svg>
                      ) : (
                        <span className='text-sm text-gray-500'>{subIndex + 1}</span>
                      )}
                    </div>
                    <span className='text-sm text-gray-600'>{subStep.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export { CreationFormSteps };
