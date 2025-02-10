import { useMutation } from '@tanstack/react-query';
import { Modal, useCouncilForm, useOverlay } from 'contexts';
import { AddressInput, Form, Input } from 'forms';
import { Variables } from 'graphql-request';
import { useEffect, useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import type { CouncilFormData, CouncilMember, FormMember } from 'types';
import { chainsMap, councilsGraphqlClient, CREATE_USER, getChainId, isValidEmail, logger, UPDATE_USER } from 'utils';
import { isAddress } from 'viem';

import { NextStepButton } from '../../next-step-button';

interface AddMemberModalProps {
  form: UseFormReturn<CouncilFormData>;
  editingMember?: CouncilMember | null;
  canEdit?: boolean;
}

export function AddMemberModal({ form: parentForm, editingMember, canEdit = true }: AddMemberModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { modals, setModals } = useOverlay();
  const { persistForm } = useCouncilForm();
  const selectedChain = parentForm.watch('chain')?.value;
  const chainId = getChainId(selectedChain);

  const modalForm = useForm({
    defaultValues: {
      address: editingMember?.address || '',
      email: editingMember?.email || '',
      name: editingMember?.name || '',
    },
  });

  const isFormValid = () => {
    const values = modalForm.getValues();
    return isAddress(values.address) && isValidEmail(values.email);
  };

  const createUserMutation = useMutation({
    mutationFn: async (variables: Variables) => {
      const result = await councilsGraphqlClient.request<{
        createUser: CouncilMember;
      }>(CREATE_USER, variables);
      return result.createUser;
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (variables: Variables) => {
      const result = await councilsGraphqlClient.request<{
        updateUser: CouncilMember;
      }>(UPDATE_USER, variables);
      return result.updateUser;
    },
  });

  const handleSubmit = async (data: FormMember) => {
    setIsLoading(true);
    if (!canEdit) return;
    const localData = data as unknown as Variables;

    if (!isAddress(data.address)) {
      modalForm.setError('address', { message: 'Please enter a valid Ethereum address' });
      return;
    }

    const currentMembers = parentForm.getValues('members') || [];

    const isDuplicate = currentMembers.some(
      (member) => member.address.toLowerCase() === data.address.toLowerCase() && member.id !== editingMember?.id,
    );

    if (isDuplicate) {
      modalForm.setError('address', { message: 'This address is already a member of the council' });
      return;
    }

    try {
      let userData: CouncilMember;

      if (editingMember) {
        userData = await updateUserMutation.mutateAsync({
          id: editingMember.id,
          address: data.address,
          email: data.email,
          name: data.name,
        });
        const updatedMembers = currentMembers.map((member) => (member.id === editingMember.id ? userData : member));
        parentForm.setValue('members', updatedMembers);
      } else {
        userData = await createUserMutation.mutateAsync(localData);
        parentForm.setValue('members', [...currentMembers, userData]);
        if (!userData.id) {
          throw new Error('Created user is missing ID');
        }
      }
      persistForm('selection', 'members');
      logger.debug('userData', userData);

      modalForm.clearErrors();
      modalForm.reset();
      setIsLoading(false);
      setModals?.({});
    } catch (error) {
      modalForm.setError('root', { message: 'Failed to save user. Please try again.' });
      logger.error('Error saving user:', error);
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setModals?.({});
  };

  useEffect(() => {
    if (modals?.addMemberModal) {
      modalForm.clearErrors();
      modalForm.reset({
        address: editingMember?.address || '',
        email: editingMember?.email || '',
        name: editingMember?.name || '',
      });
    }
  }, [modals?.addMemberModal, editingMember, modalForm]);

  return (
    <Modal
      name={`addMemberModal${editingMember?.address ? `-${editingMember.address}` : ''}`}
      title={editingMember ? 'Edit Council Member' : 'Add Council Member'}
      onClose={handleClose}
      size='lg'
    >
      <Form {...modalForm}>
        <form onSubmit={modalForm.handleSubmit(handleSubmit)} className='py-8'>
          <div className='space-y-6'>
            <AddressInput
              name='address'
              localForm={modalForm}
              label={`${chainsMap(chainId).name} Account`}
              hideAddressButtons
              chainId={chainId}
              isDisabled={!canEdit}
              variant='councils'
            />

            <Input
              name='email'
              localForm={modalForm}
              tooltip={`The email addresses are only visible to Council Admins and are primarily used as contact information for council invitation and notifications`}
              label='Email Address'
              sublabel='Hidden'
              placeholder='Email that receives the council invite'
              isDisabled={!canEdit}
              variant='councils'
              options={{
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              }}
            />

            <Input
              name='name'
              localForm={modalForm}
              label='Name'
              sublabel='Optional'
              placeholder='Alias or name'
              isDisabled={!canEdit}
              variant='councils'
            />
          </div>

          <div className='mt-8'>
            {modalForm.formState.errors.root && (
              <p className='text-destructive mb-4 text-sm'>{modalForm.formState.errors.root.message}</p>
            )}

            <div className='flex justify-end'>
              <NextStepButton type='submit' disabled={!canEdit || !isFormValid() || isLoading} withIcon={false}>
                {isLoading ? 'Submitting…' : editingMember ? 'Save Changes' : 'Add Member'}
              </NextStepButton>
            </div>
          </div>
        </form>
      </Form>
    </Modal>
  );
}
