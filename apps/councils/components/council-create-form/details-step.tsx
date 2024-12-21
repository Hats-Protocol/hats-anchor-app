'use client';

import { Spinner } from '@chakra-ui/react';
import { useCouncilForm } from 'contexts';
import { Input, Textarea } from 'forms';

import { CHAIN_OPTIONS } from '../../lib/utils/chains';
import { ChainSelect } from '../chain-select';
import { NextStepButton } from '../next-step-button';
import { findNextInvalidStep, getNextStepButtonText } from './utils';

export function DetailsStep({ onNext }: { onNext: () => void }) {
  const { form, isLoading, stepValidation } = useCouncilForm();
  const requirements = form.watch('requirements');

  if (isLoading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <Spinner size='xl' color='blue.500' />
      </div>
    );
  }

  const nextStep = findNextInvalidStep(
    stepValidation,
    'details',
    undefined,
    requirements,
  );

  return (
    <form
      className='flex h-full flex-col space-y-6'
      onSubmit={form.handleSubmit(onNext)}
    >
      <div className='flex-1 space-y-6'>
        <h2 className='text-xl font-bold'>Create your first Council</h2>

        <div className='space-y-2'>
          <label className='font-bold'>Organization Name</label>
          <p className='text-gray-600'>
            The name of the organization you are creating councils for.
          </p>
          <Input
            name='organizationName'
            localForm={form}
            placeholder='DAO or Company Name'
            options={{ required: true }}
          />
        </div>

        <div className='space-y-2'>
          <label className='font-bold'>Council Name</label>
          <p className='text-gray-600'>
            The name of your first council. You can add further councils later.
          </p>
          <Input
            name='councilName'
            localForm={form}
            placeholder='Council Name'
            options={{ required: true }}
          />
        </div>

        <div className='space-y-2'>
          <label className='font-bold'>Choose a Chain</label>
          <p className='text-gray-600'>
            The chain you deploy the Safe Multisig and Hats Council to.
          </p>
          <ChainSelect
            name='chain'
            form={form}
            options={CHAIN_OPTIONS}
            placeholder='Select a chain'
          />
        </div>

        <div className='space-y-2'>
          <label className='font-bold'>
            Council Description{' '}
            <span className='text-sm font-normal text-gray-400'>Optional</span>
          </label>
          <p className='text-gray-600'>
            Add a short description or some links you want all council members
            to see.
          </p>
          <Textarea
            name='councilDescription'
            localForm={form}
            placeholder='Bylaws, policies or important links'
          />
        </div>
      </div>

      <div className='flex justify-end py-6'>
        <NextStepButton disabled={!form.formState.isValid}>
          {getNextStepButtonText(nextStep)}
        </NextStepButton>
      </div>
    </form>
  );
}
