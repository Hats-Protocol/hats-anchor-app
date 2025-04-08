'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useMutation } from '@tanstack/react-query';
import { useCouncilForm, useOverlay } from 'contexts';
import { AddressInput, Form, Input } from 'forms';
import { useOrganization } from 'hooks';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiUserPlus } from 'react-icons/fi';
import { CouncilMember, FormMember, StepProps } from 'types';
import { Button, Skeleton } from 'ui';
import { chainsMap, CREATE_USER, getChainId, getCouncilsGraphqlClient, isValidEmail, logger, UPDATE_USER } from 'utils';
import { isAddress } from 'viem';

import { NextStepButton } from '../../next-step-button';
import { findNextInvalidStep, getNextStepButtonText } from '../utils';
import { AdminsList } from './admins-list';

export function SelectionManagementStep({ onNext }: StepProps) {
  const { form, isLoading, stepValidation, canEdit } = useCouncilForm();
  const { setModals } = useOverlay();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<CouncilMember | null>(null);
  const { getAccessToken } = usePrivy();
  const { persistForm } = useCouncilForm();

  const organizationName = form.watch('organizationName') || '';
  const orgName = typeof organizationName === 'string' ? organizationName : organizationName.value;
  const selectedChain = form.watch('chain')?.value;
  const chainId = getChainId(selectedChain);
  logger.info('organizationName', orgName);
  const { data: organization } = useOrganization(orgName);
  logger.info('organization', organization);

  // extract and flatten members from all councils
  const allMembers =
    organization?.councils?.reduce((acc: CouncilMember[], council) => {
      if (council.creationForm?.members) {
        return [...acc, ...council.creationForm.members];
      }
      return acc;
    }, []) || [];

  // remove duplicates based on member address
  const uniqueMembers = allMembers.filter(
    (member, index, self) => index === self.findIndex((m) => m.address.toLowerCase() === member.address.toLowerCase()),
  );

  logger.info('uniqueMembers', uniqueMembers);

  const admins = form.watch('admins') || [];
  const nextStep = findNextInvalidStep(stepValidation, 'selection', 'management', form.watch('requirements'));

  const modalForm = useForm({
    defaultValues: {
      address: editingAdmin?.address || '',
      email: editingAdmin?.email || '',
      name: editingAdmin?.name || '',
    },
  });

  const [formError, setFormError] = useState<string | null>(null);

  const isFormValid = () => {
    const values = modalForm.getValues();
    return isAddress(values.address) && isValidEmail(values.email);
  };

  const createUserMutation = useMutation({
    mutationFn: async (variables: { address: string; email: string; name?: string }) => {
      const accessToken = await getAccessToken();
      const result = await getCouncilsGraphqlClient(accessToken ?? undefined).request<{
        createUser: CouncilMember;
      }>(CREATE_USER, variables);
      return result.createUser;
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (variables: { id: string; address: string; email: string; name?: string }) => {
      const accessToken = await getAccessToken();
      const result = await getCouncilsGraphqlClient(accessToken ?? undefined).request<{
        updateUser: CouncilMember;
      }>(UPDATE_USER, variables);
      return result.updateUser;
    },
  });

  const handleSubmit = async (data: FormMember) => {
    if (!canEdit) return;

    if (!isAddress(data.address)) {
      setFormError('Please enter a valid Ethereum address');
      return;
    }

    const currentAdmins = form.getValues('admins') || [];
    const isDuplicate = currentAdmins.some(
      (admin) => admin.address.toLowerCase() === data.address.toLowerCase() && admin.id !== editingAdmin?.id,
    );

    if (isDuplicate) {
      setFormError('This address is already an admin of the council');
      return;
    }

    try {
      let userData: CouncilMember;

      if (editingAdmin) {
        userData = await updateUserMutation.mutateAsync({
          id: editingAdmin.id,
          address: data.address,
          email: data.email,
          name: data.name,
        });
        const updatedAdmins = currentAdmins.map((admin) => (admin.id === editingAdmin.id ? userData : admin));
        form.setValue('admins', updatedAdmins);
      } else {
        userData = await createUserMutation.mutateAsync(data);
        form.setValue('admins', [...currentAdmins, userData]);
      }
      persistForm('selection', 'management');
      logger.debug('userData', userData);

      setFormError(null);
      modalForm.reset();
      setShowAddForm(false);
      setEditingAdmin(null);
    } catch (error) {
      setFormError('Failed to save user. Please try again.');
      logger.error('Error saving user:', error);
    }
  };

  // Reset form when editing admin changes
  React.useEffect(() => {
    if (editingAdmin) {
      setFormError(null);
      modalForm.reset({
        address: editingAdmin.address || '',
        email: editingAdmin.email || '',
        name: editingAdmin.name || '',
      });
    }
  }, [editingAdmin, modalForm]);

  if (isLoading) {
    return (
      <div className='mx-auto flex w-full flex-col space-y-6'>
        <Skeleton className='h-8 w-48' />

        <div className='space-y-8'>
          <div className='space-y-2'>
            <Skeleton className='h-6 w-56' />
            <Skeleton className='h-5 w-96' />
          </div>

          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Skeleton className='h-4 w-4' />
                <Skeleton className='h-5 w-32' />
              </div>
              <div className='flex items-center gap-2'>
                <Skeleton className='h-4 w-8' />
                <Skeleton className='h-4 w-4' />
              </div>
            </div>
          </div>

          <div className='flex items-center justify-between'>
            <Skeleton className='h-10 w-48' />
          </div>
        </div>

        <div className='flex justify-end py-6'>
          <Skeleton className='h-10 w-32' />
        </div>
      </div>
    );
  }

  return (
    <form className='mx-auto flex w-full flex-col space-y-6' onSubmit={form.handleSubmit(onNext)}>
      <h1 className='text-2xl font-bold'>Council Managers</h1>

      <div className='space-y-8'>
        <div className='space-y-2'>
          <h2 className='font-bold'>Who can edit the council?</h2>
          <p className='text-sm'>Council Members can add and remove council members and edit all Council settings.</p>
        </div>

        {admins.length > 0 && (
          <div>
            <AdminsList
              name='admins'
              admins={admins}
              form={form}
              canEdit={canEdit}
              onEdit={(admin) => {
                setEditingAdmin(admin);
                setShowAddForm(true);
              }}
            />
          </div>
        )}

        {!showAddForm ? (
          <div className='flex items-center justify-between'>
            <Button
              variant='outline-blue'
              rounded='full'
              onClick={() => {
                setEditingAdmin(null);
                setShowAddForm(true);
              }}
              disabled={!canEdit}
              type='button'
            >
              <FiUserPlus className='mr-2 h-4 w-4' />
              Add Council Manager
            </Button>
          </div>
        ) : (
          <div className='space-y-6 rounded-lg border border-gray-200 p-6'>
            <Form {...modalForm}>
              <div className='space-y-6'>
                <div className='space-y-6'>
                  <div className='space-y-2'>
                    <AddressInput
                      name='address'
                      label={`${chainsMap(chainId).name} Account`}
                      localForm={modalForm}
                      hideAddressButtons
                      chainId={chainId}
                      variant='councils'
                      isDisabled={!canEdit}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Input
                      name='email'
                      localForm={modalForm}
                      label='Email Address'
                      labelNote='Hidden'
                      placeholder='Email that receives the admin invite'
                      variant='councils'
                      options={{
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      }}
                      isDisabled={!canEdit}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Input
                      name='name'
                      label='Name'
                      labelNote='Optional'
                      variant='councils'
                      localForm={modalForm}
                      placeholder='Alias or name'
                      isDisabled={!canEdit}
                    />
                  </div>
                </div>

                {formError && <p className='text-destructive text-sm'>{formError}</p>}

                <div className='flex items-center justify-end gap-3'>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setShowAddForm(false);
                      setFormError(null);
                      modalForm.reset();
                      setEditingAdmin(null);
                    }}
                    type='button'
                  >
                    Cancel
                  </Button>
                  <NextStepButton
                    onClick={() => modalForm.handleSubmit(handleSubmit)()}
                    disabled={!canEdit || !isFormValid()}
                    withIcon={false}
                    type='button'
                  >
                    {editingAdmin ? 'Save Changes' : 'Add Council Manager'}
                  </NextStepButton>
                </div>
              </div>
            </Form>
          </div>
        )}
      </div>

      <div className='flex justify-end py-6'>
        <NextStepButton disabled={!form.formState.isValid || !canEdit}>
          {getNextStepButtonText(nextStep)}
        </NextStepButton>
      </div>
    </form>
  );
}
