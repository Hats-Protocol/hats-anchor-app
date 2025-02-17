import { useMutation } from '@tanstack/react-query';
import { Modal, useCouncilForm, useOverlay } from 'contexts';
import { AddressInput, Form, Input } from 'forms';
import { useEffect, useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import type { CouncilFormData, CouncilMember, FormMember } from 'types';
import { chainsMap, councilsGraphqlClient, CREATE_USER, getChainId, isValidEmail, logger, UPDATE_USER } from 'utils';
import { isAddress } from 'viem';

import { NextStepButton } from '../../next-step-button';

interface AddAdminModalProps {
  form: UseFormReturn<CouncilFormData>;
  editingAdmin?: CouncilMember | null;
  // setEditingAdmin: Dispatch<SetStateAction<CouncilMember | null>>;
  canEdit?: boolean;
}

export function AddAdminModal({ form: parentForm, editingAdmin, canEdit = true }: AddAdminModalProps) {
  const selectedChain = parentForm.watch('chain')?.value;
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
      const result = await councilsGraphqlClient.request<{
        createUser: CouncilMember;
      }>(CREATE_USER, variables);
      return result.createUser;
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (variables: { id: string; address: string; email: string; name?: string }) => {
      const result = await councilsGraphqlClient.request<{
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

    const currentAdmins = parentForm.getValues('admins') || [];

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
        parentForm.setValue('admins', updatedAdmins);
      } else {
        userData = await createUserMutation.mutateAsync(data);
        parentForm.setValue('admins', [...currentAdmins, userData]);
      }
      persistForm('selection', 'management');
      logger.debug('userData', userData);

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
    // setEditingAdmin(null);
  };

  useEffect(() => {
    if (modals?.addAdminModal) {
      setFormError(null);
      modalForm.reset({
        address: editingAdmin?.address || '',
        email: editingAdmin?.email || '',
        name: editingAdmin?.name || '',
      });
    }
  }, [modals?.addAdminModal, editingAdmin, modalForm]);

  return (
    <Modal
      name={`addAdminModal${editingAdmin?.id ? `-${editingAdmin.id}` : ''}`}
      title={editingAdmin ? 'Edit Council Manager' : 'Add Council Manager'}
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
                labelNote='Optional'
                variant='councils'
                localForm={modalForm}
                placeholder='Alias or name'
                isDisabled={!canEdit}
              />
            </div>
          </div>

          <div className='mt-8'>
            {formError && <p className='text-destructive mb-4 text-sm'>{formError}</p>}
            <div className='flex justify-end'>
              <NextStepButton type='submit' disabled={!canEdit || !isFormValid()} withIcon={false}>
                {editingAdmin ? 'Save Changes' : 'Add Council Manager'}
              </NextStepButton>
            </div>
          </div>
        </form>
      </Form>
    </Modal>
  );
}
