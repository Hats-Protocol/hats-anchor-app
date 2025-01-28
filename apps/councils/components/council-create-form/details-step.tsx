'use client';

import { useCouncilForm } from 'contexts';
import { ChainSelect, Form, Input, Textarea } from 'forms';
import { StepProps } from 'types';
import { Skeleton } from 'ui';

import { NextStepButton } from '../next-step-button';
import { findNextInvalidStep, getNextStepButtonText } from './utils';

export function DetailsStep({ onNext }: StepProps) {
  const { form: localForm, isLoading, stepValidation, canEdit } = useCouncilForm();
  const { watch, handleSubmit } = localForm;
  const requirements = watch('requirements');

  if (isLoading) {
    return <Skeleton className='h-100 w-100' />;
  }

  const nextStep = findNextInvalidStep(stepValidation, 'details', undefined, requirements);

  return (
    <Form {...localForm}>
      <form className='flex h-full flex-col space-y-6' onSubmit={handleSubmit(onNext)}>
        <div className='flex-1 space-y-6'>
          <h2 className='text-xl font-bold'>Create your first Council</h2>

          <div className='space-y-2'>
            <label className='font-bold'>Organization Name</label>
            <p className='text-sm text-gray-600'>The name of the organization you are creating councils for.</p>
            <Input
              name='organizationName'
              localForm={localForm}
              placeholder='DAO or Company Name'
              options={{ required: true }}
              isDisabled={!canEdit}
            />
          </div>

          <div className='space-y-2'>
            <label className='font-bold'>Council Name</label>
            <p className='text-sm text-gray-600'>The name of your first council. You can add further councils later.</p>
            <Input
              name='councilName'
              localForm={localForm}
              placeholder='Council Name'
              options={{ required: true }}
              isDisabled={!canEdit}
            />
          </div>

          <div className='space-y-2'>
            <label className='font-bold'>Choose a Chain</label>
            <p className='text-sm text-gray-600'>The chain you deploy the Safe Multisig and Hats Council to.</p>
            <ChainSelect name='chain' localForm={localForm} placeholder='Select a chain' isDisabled={!canEdit} />
          </div>

          <div className='space-y-2'>
            <label className='font-bold'>
              Council Description <span className='text-sm font-normal text-gray-400'>Optional</span>
            </label>
            <p className='text-sm text-gray-600'>
              Add a short description or some links you want all council members to see.
            </p>
            <Textarea
              name='councilDescription'
              localForm={localForm}
              placeholder='Bylaws, policies or important links'
              isDisabled={!canEdit}
            />
          </div>
        </div>

        <div className='flex justify-end py-6'>
          <NextStepButton disabled={!localForm.formState.isValid || !canEdit}>
            {getNextStepButtonText(nextStep)}
          </NextStepButton>
        </div>
      </form>
    </Form>
  );
}
