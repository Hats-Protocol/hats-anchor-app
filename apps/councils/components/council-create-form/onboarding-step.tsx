'use client';

import { useCouncilForm } from 'contexts';
import { Form, RadioCard, RequirementBox } from 'forms';
import { FileText, GemIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import { IconType } from 'react-icons';
import { BsPersonCheck } from 'react-icons/bs';
import { StepProps } from 'types';
import { Skeleton } from 'ui';

import { NextStepButton } from '../next-step-button';
import { findNextInvalidStep, getNextStepButtonText } from './utils';

const BallotBox = dynamic(() => import('icons').then((mod) => mod.BallotBox), { ssr: false });
const DocumentChecks = dynamic(() => import('icons').then((mod) => mod.DocumentChecks), { ssr: false });

export function OnboardingStep({ onNext }: StepProps) {
  const { form, isLoading, stepValidation, canEdit } = useCouncilForm();
  const requirements = form.watch('requirements');

  const nextStep = findNextInvalidStep(stepValidation, 'onboarding', undefined, requirements);

  if (isLoading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <Skeleton className='h-10 w-10' />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form className='flex h-full flex-col gap-8' onSubmit={form.handleSubmit(onNext)}>
        <div className='flex flex-col gap-8'>
          <h2 className='text-2xl font-bold'>Council Membership</h2>

          <div className='flex flex-col gap-4'>
            <h3 className='text-lg font-semibold'>How is the Council selected?</h3>

            <RadioCard
              name='membershipType'
              localForm={form}
              isDisabled={!canEdit}
              options={[
                {
                  label: 'Appoint Council Members',
                  value: 'APPOINTED',
                  description: 'Council Managers manually choose the set of council members',
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
              name='requirements'
              localForm={form}
              isDisabled={!canEdit}
              options={[
                {
                  key: 'signAgreement',
                  icon: FileText as IconType,
                  title: 'Sign Agreement',
                  description: 'Create an agreement council members have to sign and abide by',
                },
                {
                  key: 'holdTokens',
                  icon: GemIcon as IconType,
                  title: 'Hold Tokens',
                  description: 'Specify an amount of coins council members need to hold',
                },
                {
                  key: 'passCompliance',
                  icon: BsPersonCheck as IconType,
                  title: 'Pass Compliance Check',
                  description: 'Choose a trusted onchain provider that gathers KYC data securely',
                },
              ]}
            />
          </div>
        </div>

        <div className='flex justify-end py-6'>
          <NextStepButton disabled={!form.formState.isValid || !canEdit}>
            {getNextStepButtonText(nextStep)}
          </NextStepButton>
        </div>
      </form>
    </Form>
  );
}
