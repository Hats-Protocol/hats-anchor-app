'use client';

import { useCouncilForm } from 'contexts';
import { Form, RadioCard, RequirementBox } from 'forms';
import { useCouncilDeployFlag } from 'hooks';
import { BallotBox, DocumentChecks } from 'icons';
import { FileText, GemIcon } from 'lucide-react';
import { IconType } from 'react-icons';
import { BsPersonCheck } from 'react-icons/bs';
import { StepProps } from 'types';
import { Skeleton } from 'ui';

import { NextStepButton } from '../next-step-button';
import { findNextInvalidStep, getNextStepButtonText } from './utils';

const LoadingSelectStep = () => {
  return (
    <div className='flex h-full flex-col gap-8'>
      <div className='flex flex-col gap-8'>
        <Skeleton className='h-8 w-48' />

        <div className='flex flex-col gap-4'>
          <Skeleton className='h-6 w-64' />

          <div className='flex flex-col gap-4'>
            {[1, 2].map((i) => (
              <div key={i} className='flex items-center justify-between rounded-lg border border-gray-200 px-6 py-4'>
                <div className='flex gap-4'>
                  <Skeleton className='h-6 w-6' />
                  <div className='flex flex-col gap-0.5'>
                    <Skeleton className='h-5 w-48' />
                    <Skeleton className='h-4 w-64' />
                  </div>
                </div>
                <Skeleton className='h-4 w-4' />
              </div>
            ))}
          </div>
        </div>

        <div className='flex flex-col gap-4'>
          <Skeleton className='h-6 w-64' />

          <div className='flex flex-col gap-4'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='flex items-center justify-between rounded-lg border border-gray-200 px-6 py-4'>
                <div className='flex gap-4'>
                  <Skeleton className='h-6 w-6' />
                  <div className='flex flex-col gap-0.5'>
                    <Skeleton className='h-5 w-48' />
                    <Skeleton className='h-4 w-64' />
                  </div>
                </div>
                <Skeleton className='h-4 w-4' />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className='flex justify-end py-6'>
        <Skeleton className='h-10 w-32' />
      </div>
    </div>
  );
};

export function SelectionStep({ onNext, draftId }: StepProps) {
  const { form: councilForm, isLoading, stepValidation, canEdit } = useCouncilForm();
  const eligibilityRequirements = councilForm.watch('eligibilityRequirements');

  useCouncilDeployFlag(draftId);

  const nextStep = findNextInvalidStep(stepValidation, 'selection', undefined, eligibilityRequirements);

  if (isLoading) {
    return <LoadingSelectStep />;
  }

  return (
    <Form {...councilForm}>
      <form className='flex h-full flex-col gap-8' onSubmit={councilForm.handleSubmit(onNext)}>
        <div className='flex flex-col gap-8'>
          <h2 className='text-2xl font-bold'>Council Membership</h2>

          <div className='flex flex-col gap-4'>
            <h3 className='text-lg font-semibold'>How is the Council selected?</h3>

            <RadioCard
              name='membershipType'
              localForm={councilForm}
              isDisabled={!canEdit}
              options={[
                {
                  label: 'Appoint Council Members',
                  value: 'APPOINTED',
                  description: 'Select a list of eligible Council Members',
                  icon: DocumentChecks as IconType,
                },
                {
                  label: 'Elect Council Members',
                  value: 'ELECTED',
                  description: 'Empower your community to elect the council members onchain',
                  icon: BallotBox as IconType,
                  disabled: true,
                },
              ]}
              textSize='md'
            />
          </div>

          <div className='flex flex-col gap-4'>
            <h3 className='text-lg font-semibold'>What is required to join the Council?</h3>

            <RequirementBox
              name='eligibilityRequirements'
              localForm={councilForm}
              isDisabled={!canEdit}
              options={[
                {
                  key: 'agreement.required',
                  icon: FileText as IconType,
                  title: 'Sign Agreement',
                  description: 'Create an agreement council members have to sign and abide by',
                },
                {
                  key: 'erc20.required',
                  icon: GemIcon as IconType,
                  title: 'Hold Tokens',
                  description: 'Specify an amount of coins council members need to hold',
                },
                {
                  key: 'compliance.required',
                  icon: BsPersonCheck as IconType,
                  title: 'Pass Compliance Check',
                  description: 'Choose a trusted onchain provider that gathers KYC data securely',
                },
              ]}
            />
          </div>
        </div>

        <div className='flex justify-end py-6'>
          <NextStepButton disabled={!councilForm.formState.isValid || !canEdit}>
            {getNextStepButtonText(nextStep)}
          </NextStepButton>
        </div>
      </form>
    </Form>
  );
}
