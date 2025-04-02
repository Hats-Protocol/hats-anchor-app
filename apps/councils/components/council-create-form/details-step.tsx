'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useCouncilForm } from 'contexts';
import { ChainSelect, Form, Input, Select, Textarea } from 'forms';
import { useCouncilDeployFlag, useToast } from 'hooks';
import { get } from 'lodash';
import { StepProps } from 'types';
import { MemberAvatar, Skeleton } from 'ui';
import { getOrganizationByName } from 'utils';

import { NextStepButton } from '../next-step-button';
import { findNextInvalidStep, getNextStepButtonText } from './utils';

export function DetailsStep({ onNext, draftId }: StepProps) {
  const { form: localForm, isLoading, stepValidation, canEdit } = useCouncilForm();
  const { watch, handleSubmit } = localForm;
  const requirements = watch('requirements');
  const { getAccessToken } = usePrivy();
  const { toast } = useToast();

  useCouncilDeployFlag(draftId);

  if (isLoading) {
    return (
      <div className='flex h-full flex-col space-y-6'>
        <div className='flex-1 space-y-6'>
          <h2 className='text-xl font-bold'>
            <Skeleton className='h-7 w-56' />
          </h2>

          <div className='space-y-6'>
            {/* Organization Name */}
            <div className='space-y-2'>
              <div className='flex items-baseline justify-between'>
                <Skeleton className='h-5 w-36' /> {/* Label */}
              </div>
              <Skeleton className='h-4 w-96' /> {/* Sub Label */}
              <div className='relative'>
                <Skeleton className='h-10 w-full rounded-md' /> {/* Input */}
              </div>
            </div>

            {/* Council Name */}
            <div className='space-y-2'>
              <div className='flex items-baseline justify-between'>
                <Skeleton className='h-5 w-28' />
              </div>
              <Skeleton className='h-4 w-[420px]' />
              <div className='relative'>
                <Skeleton className='h-10 w-full rounded-md' />
              </div>
            </div>

            {/* Chain Select */}
            <div className='space-y-2'>
              <div className='flex items-baseline justify-between'>
                <Skeleton className='h-5 w-32' />
              </div>
              <Skeleton className='h-4 w-[380px]' />
              <div className='relative'>
                <Skeleton className='h-10 w-full rounded-md' />
                <div className='absolute right-3 top-1/2 -translate-y-1/2'>
                  <Skeleton className='h-4 w-4' /> {/* Dropdown icon */}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className='space-y-2'>
              <div className='flex items-baseline justify-between'>
                <Skeleton className='h-5 w-40' />
                <Skeleton className='h-4 w-16' /> {/* Optional label */}
              </div>
              <Skeleton className='h-4 w-[460px]' />
              <Skeleton className='h-24 w-full rounded-md' /> {/* Textarea */}
            </div>
          </div>
        </div>

        <div className='flex justify-end py-6'>
          <Skeleton className='h-9 w-32' />
        </div>
      </div>
    );
  }

  const errorToast = (error: Error) => {
    toast({
      title: 'Error fetching organization',
      description: error.message?.slice(0, 100),
      variant: 'destructive',
    });
  };

  const nextStep = findNextInvalidStep(stepValidation, 'details', undefined, requirements);

  return (
    <Form {...localForm}>
      <form className='flex h-full flex-col space-y-6' onSubmit={handleSubmit(onNext)}>
        <div className='flex-1 space-y-6'>
          <h2 className='text-xl font-bold'>Create your first Council</h2>

          <div className='space-y-2'>
            {/* <Input
              name='organizationName'
              localForm={localForm}
              label='Organization Name'
              subLabel='The name of the organization you are creating councils for.'
              variant='councils'
              placeholder='DAO or Company Name'
              options={{
                required: true,
                validate: async (value) => {
                  const accessToken = await getAccessToken();
                  const result = await getOrganizationByName({ name: value, accessToken }).catch((error) => {
                    errorToast(error);
                    return true;
                  });
                  const existingOrganization = get(result, 'organizations[0]');
                  if (existingOrganization) {
                    return 'Organization with this name already exists!';
                  }
                  return true;
                },
              }}
              isDisabled={!canEdit}
            /> */}
            <Select
              name='organizationName'
              localForm={localForm}
              label='Organization Name'
              subLabel='The name of the organization you are creating councils for.'
              variant='councils'
              options={[]}
            />
          </div>

          <div className='space-y-2'>
            <Select
              name='orgChain'
              localForm={localForm}
              label='Organization Chain'
              subLabel='The chain you will deploy the Safe Multisig and Hats Council to.'
              variant='councils'
              options={[]}
            />
          </div>
          <div className='flex flex-col space-y-2'>
            <span className='text-base font-bold normal-case'>Organization Owner</span>
            <p className='text-sm text-gray-600'>
              Organization Owners can add and remove any addresses, change all Membership Criteria, deploy and edit
              Safes and Councils. You can change this after deploying.
            </p>
            <MemberAvatar member={{ address: '0x25709998B542f1Be27D19Fa0B3A9A67302bc1b94' }} stack />
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
