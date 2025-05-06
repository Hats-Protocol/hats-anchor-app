'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useMutation } from '@tanstack/react-query';
import { useCouncilForm } from 'contexts';
import { AddressInput, Form, Input } from 'forms';
import { useEffect, useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import type { CouncilFormData, CouncilMember } from 'types';
import { chainsMap, CREATE_USER, getChainId, getCouncilsGraphqlClient, isValidEmail, logger, UPDATE_USER } from 'utils';
import { isAddress } from 'viem';

import { NextStepButton } from '../../next-step-button';

interface AddAgreementAdminFormProps {
  parentForm: UseFormReturn<CouncilFormData>;
  editingAdmin?: CouncilMember | null;
  canEdit?: boolean;
  onClose?: () => void;
  className?: string;
}

export function AddAgreementAdminForm({
  parentForm,
  editingAdmin,
  canEdit = true,
  onClose,
  className,
}: AddAgreementAdminFormProps) {
  const selectedChain = parentForm.watch('chain')?.value;
  const { getAccessToken } = usePrivy();
  const chainId = getChainId(selectedChain);
  const { persistForm } = useCouncilForm();
  const form = useForm({
    defaultValues: {
      address: editingAdmin?.address || '',
      email: editingAdmin?.email || '',
      name: editingAdmin?.name || '',
    },
  });

  const [formError, setFormError] = useState<string | null>(null);

  const isFormValid = () => {
    const values = form.getValues();
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

  const handleSubmit = async (data: { address: string; email: string; name?: string }) => {
    if (!canEdit) return;

    if (!isAddress(data.address)) {
      setFormError('Please enter a valid Ethereum address');
      return;
    }

    const currentAdmins = parentForm.getValues('agreementAdmins') || [];

    const isDuplicate = currentAdmins.some(
      (admin) => admin.address.toLowerCase() === data.address.toLowerCase() && admin.id !== editingAdmin?.id,
    );

    if (isDuplicate) {
      setFormError('This address is already an agreement manager');
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
        parentForm.setValue('agreementAdmins', updatedAdmins);
      } else {
        userData = await createUserMutation.mutateAsync(data);
        parentForm.setValue('agreementAdmins', [...currentAdmins, userData]);
      }
      persistForm('eligibility', 'agreement');

      setFormError(null);
      form.reset();
      onClose?.();
    } catch (error) {
      setFormError('Failed to save user. Please try again.');
      logger.error('Error saving user:', error);
    }
  };

  useEffect(() => {
    setFormError(null);
    form.reset({
      address: editingAdmin?.address || '',
      email: editingAdmin?.email || '',
      name: editingAdmin?.name || '',
    });
  }, [editingAdmin, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className={className}>
        <div className='space-y-6'>
          <div className='space-y-2'>
            <AddressInput
              name='address'
              label={`${chainsMap(chainId).name} Account`}
              variant='councils'
              localForm={form}
              hideAddressButtons
              chainId={chainId}
              isDisabled={!canEdit}
            />
          </div>

          <div className='space-y-2'>
            <Input
              name='email'
              label='Email Address'
              labelNote='Hidden'
              variant='councils'
              localForm={form}
              placeholder='Email that receives the invite'
              isDisabled={!canEdit}
              options={{
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              }}
            />
          </div>

          <div className='space-y-2'>
            <Input
              name='name'
              label='Name'
              labelNote='Optional'
              variant='councils'
              localForm={form}
              placeholder='Alias or name'
              isDisabled={!canEdit}
            />
          </div>
        </div>

        <div className='mt-8'>
          {formError && <p className='mb-4 text-sm text-red-500'>{formError}</p>}
          <div className='flex justify-end gap-4'>
            {onClose && (
              <button
                type='button'
                onClick={onClose}
                className='rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100'
              >
                Cancel
              </button>
            )}
            <NextStepButton type='submit' disabled={!canEdit || !isFormValid()} withIcon={false}>
              {editingAdmin ? 'Save Changes' : 'Add Manager'}
            </NextStepButton>
          </div>
        </div>
      </form>
    </Form>
  );
}
