'use client';

import { useCouncilForm } from 'contexts';
import Link from 'next/link';

interface Step {
  id: string;
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
    label: 'Invite People',
    sublabel: 'Configure the chosen access modules',
    subSteps: [],
  },
  {
    id: 'payment',
    label: 'Payment & deploying',
    sublabel: 'Deploy contracts or save & share configuration',
  },
];

interface CreationFormStepsProps {
  currentStep: string;
  currentSubStep?: string;
  draftId: string;
}

function getSubStepStatus(
  subStepId: string,
  currentSubStep: string | undefined,
  requirements: {
    signAgreement: boolean;
    passCompliance: boolean;
    holdTokens: boolean;
  },
) {
  const order = [
    'members',
    'management',
    ...(requirements.signAgreement ? ['agreement'] : []),
    ...(requirements.holdTokens ? ['tokens'] : []),
    ...(requirements.passCompliance ? ['compliance'] : []),
  ];
  const currentIndex = order.indexOf(currentSubStep || '');
  const stepIndex = order.indexOf(subStepId);

  return stepIndex < currentIndex
    ? 'completed'
    : stepIndex === currentIndex
      ? 'current'
      : 'upcoming';
}

export function CreationFormSteps({
  currentStep,
  currentSubStep,
  draftId,
}: CreationFormStepsProps) {
  const { form } = useCouncilForm();
  const requirements = form.watch('requirements');

  const STEPS = [...BASE_STEPS];
  const selectionStep = STEPS.find((step) => step.id === 'selection');
  if (selectionStep) {
    selectionStep.subSteps = [
      { id: 'members', label: 'Council Members' },
      { id: 'management', label: 'Council Management' },
      ...(requirements?.signAgreement
        ? [{ id: 'agreement', label: 'Agreement' }]
        : []),
      ...(requirements?.holdTokens
        ? [{ id: 'tokens', label: 'Token Requirements' }]
        : []),
      ...(requirements?.passCompliance
        ? [{ id: 'compliance', label: 'Compliance Check' }]
        : []),
    ];
  }

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className='flex flex-col'>
      {STEPS.map((step, index) => (
        <div key={step.id}>
          <Link
            href={
              step.id === 'selection'
                ? `/councils/new/${step.id}?subStep=members&draftId=${draftId}`
                : `/councils/new/${step.id}?draftId=${draftId}`
            }
          >
            <div className='flex gap-4'>
              <div className='flex flex-col items-center'>
                {/* Main step circle */}
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${
                    index < currentStepIndex
                      ? 'bg-white'
                      : 'border-2 ' +
                        (index === currentStepIndex
                          ? 'border-blue-500 bg-blue-100'
                          : 'border-gray-200 bg-white')
                  } `}
                >
                  {index < currentStepIndex ? (
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
                    <span className={`text-lg text-black`}>{index + 1}</span>
                  )}
                </div>

                {/* Vertical line */}
                {step.id === 'payment' ||
                (step.id === 'selection' &&
                  currentStep === 'selection') ? null : (
                  <div
                    className={`my-3 h-12 w-[2px] ${
                      index < currentStepIndex ? 'bg-blue-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>

              <div className=''>
                <span className='text-base font-medium text-gray-900'>
                  {step.label}
                </span>
                <span className='block text-sm text-gray-500'>
                  {step.sublabel}
                </span>
              </div>
            </div>
          </Link>

          {/* Sub-steps */}
          {currentStep === 'selection' &&
            step.id === 'selection' &&
            step.subSteps && (
              <div className='my-3 ml-[23px]'>
                {step.subSteps.map((subStep, subIndex) => {
                  const isCompleted =
                    getSubStepStatus(
                      subStep.id,
                      currentSubStep,
                      form.watch('requirements'),
                    ) === 'completed';
                  const isCurrent = subStep.id === currentSubStep;

                  return (
                    <Link
                      key={subStep.id}
                      href={`/councils/new/selection?subStep=${subStep.id}&draftId=${draftId}`}
                    >
                      <div
                        className={`flex items-center gap-3 border-l-[2px] ${
                          isCompleted
                            ? 'border-l-blue-500'
                            : 'border-l-gray-200'
                        }`}
                      >
                        <div
                          className={`my-1 ml-4 flex h-6 w-6 items-center justify-center rounded-full ${
                            isCurrent
                              ? 'border border-blue-500 bg-blue-100'
                              : 'border border-gray-200 bg-white'
                          }`}
                        >
                          {isCompleted ? (
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
                            <span className='text-sm text-gray-500'>
                              {subIndex + 1}
                            </span>
                          )}
                        </div>
                        <span className='text-sm text-gray-600'>
                          {subStep.label}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
        </div>
      ))}
    </div>
  );
}
