'use client';

import { useCouncilForm } from 'contexts';
import { ChainSelect, Form, Input, Textarea } from 'forms';
import { useCouncilDeployFlag } from 'hooks';
import { StepProps } from 'types';
import { Skeleton } from 'ui';

import { NextStepButton } from '../next-step-button';
import { findNextInvalidStep, getNextStepButtonText } from './utils';

export function DetailsStep({ onNext, draftId }: StepProps) {
  const { form: localForm, isLoading, stepValidation, canEdit } = useCouncilForm();
  const { watch, handleSubmit } = localForm;
  const requirements = watch('requirements');

  useCouncilDeployFlag(draftId);

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
            <Input
              name='organizationName'
              localForm={localForm}
              label='Organization Name'
              subLabel='The name of the organization you are creating councils for.'
              variant='councils'
              placeholder='DAO or Company Name'
              options={{ required: true }}
              isDisabled={!canEdit}
            />
          </div>

          <div className='space-y-2'>
            <Input
              name='councilName'
              localForm={localForm}
              label='Council Name'
              subLabel='The name of your first council. You can add further councils later.'
              variant='councils'
              placeholder='Council Name'
              options={{ required: true }}
              isDisabled={!canEdit}
            />
          </div>

          <div className='space-y-2'>
            <ChainSelect
              name='chain'
              localForm={localForm}
              label='Choose a Chain'
              subLabel='The chain you deploy the Safe Multisig and Hats Council to.'
              variant='councils'
              placeholder='Select a chain'
              isDisabled={!canEdit}
            />
          </div>

          <div className='space-y-2'>
            <Textarea
              name='councilDescription'
              localForm={localForm}
              label='Council Description'
              labelNote='Optional'
              subLabel='Add a short description or some links you want all council members to see.'
              variant='councils'
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
