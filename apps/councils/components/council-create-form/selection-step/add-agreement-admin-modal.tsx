'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useMutation } from '@tanstack/react-query';
import { Modal, useCouncilForm, useOverlay } from 'contexts';
import { AddressInput, Form, Input } from 'forms';
import { useEffect, useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import type { CouncilFormData, CouncilMember } from 'types';
import { chainsMap, CREATE_USER, getChainId, getCouncilsGraphqlClient, isValidEmail, logger, UPDATE_USER } from 'utils';
import { isAddress } from 'viem';

import { NextStepButton } from '../../next-step-button';

interface AddAgreementAdminModalProps {
  form: UseFormReturn<CouncilFormData>;
  editingAdmin?: CouncilMember | null;
  canEdit?: boolean;
}

export function AddAgreementAdminModal({
  form: parentForm,
  editingAdmin,
  canEdit = true,
}: AddAgreementAdminModalProps) {
  const selectedChain = parentForm.watch('chain')?.value;
  const { getAccessToken } = usePrivy();
  const chainId = getChainId(selectedChain);
  const { modals, setModals } = useOverlay();
  const { persistForm } = useCouncilForm();
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
      persistForm('selection', 'agreement');

      setFormError(null);
      modalForm.reset();
      setModals?.({});
    } catch (error) {
      setFormError('Failed to save user. Please try again.');
      logger.error('Error saving user:', error);
    }
  };

  const handleClose = () => {
    setModals?.({});
  };

  useEffect(() => {
    if (modals?.addAgreementAdminModal) {
      setFormError(null);
      modalForm.reset({
        address: editingAdmin?.address || '',
        email: editingAdmin?.email || '',
        name: editingAdmin?.name || '',
      });
    }
  }, [modals?.addAgreementAdminModal, editingAdmin, modalForm]);

  return (
    <Modal
      name={`addAgreementAdminModal${editingAdmin?.id ? `-${editingAdmin.id}` : ''}`}
      title={editingAdmin ? 'Edit Agreement Manager' : 'Add Agreement Manager'}
      onClose={handleClose}
      size='lg'
    >
      <Form {...modalForm}>
        <form onSubmit={modalForm.handleSubmit(handleSubmit)} className='py-8'>
          <div className='space-y-6'>
            <div className='space-y-2'>
              <AddressInput
                name='address'
                label={`${chainsMap(chainId).name} Account`}
                variant='councils'
                localForm={modalForm}
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
                localForm={modalForm}
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
                localForm={modalForm}
                placeholder='Alias or name'
                isDisabled={!canEdit}
              />
            </div>
          </div>

          <div className='mt-8'>
            {formError && <p className='mb-4 text-sm text-red-500'>{formError}</p>}
            <div className='flex justify-end'>
              <NextStepButton type='submit' disabled={!canEdit || !isFormValid()} withIcon={false}>
                {editingAdmin ? 'Save Changes' : 'Add Manager'}
              </NextStepButton>
            </div>
          </div>
        </form>
      </Form>
    </Modal>
  );
}
