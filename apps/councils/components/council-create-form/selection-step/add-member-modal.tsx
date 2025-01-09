'use client';

import { Modal, ModalContent, ModalOverlay } from '@chakra-ui/react';
import { useMutation } from '@tanstack/react-query';
import type { CouncilFormData } from 'contexts';
import { AddressInput, Input } from 'forms';
import { useEffect, useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { FiX } from 'react-icons/fi';
import { councilsGraphqlClient } from 'utils';
import { isAddress } from 'viem';

import { getChainId } from '../../../lib/utils/chains';
import { NextStepButton } from '../../next-step-button';

interface CouncilMember {
  id: string;
  address: string;
  email: string;
  name?: string;
}

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: UseFormReturn<CouncilFormData>;
  editingMember?: CouncilMember | null;
  canEdit?: boolean;
}

const CREATE_USER = `
  mutation CreateUser($address: String!, $email: String!, $name: String) {
    createUser(address: $address, email: $email, name: $name) {
      id
      address
      email
      name
    }
  }
`;

const UPDATE_USER = `
  mutation UpdateUser($id: ID!, $address: String!, $email: String!, $name: String) {
    updateUser(id: $id, address: $address, email: $email, name: $name) {
      id
      address 
      email
      name
    }
  }
`;

export function AddMemberModal({
  isOpen,
  onClose,
  form: parentForm,
  editingMember,
  canEdit = true,
}: AddMemberModalProps) {
  const selectedChain = parentForm.watch('chain');
  const chainId = getChainId(selectedChain);

  const modalForm = useForm({
    defaultValues: {
      address: editingMember?.address || '',
      email: editingMember?.email || '',
      name: editingMember?.name || '',
    },
  });

  const [formError, setFormError] = useState<string | null>(null);

  const isValidEmail = (email: string) => {
    return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);
  };

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

  const handleSubmit = async (data: { address: string; email: string; name?: string }) => {
    if (!canEdit) return;

    if (!isAddress(data.address)) {
      setFormError('Please enter a valid Ethereum address');
      return;
    }

    const currentMembers = parentForm.getValues('members') || [];

    const isDuplicate = currentMembers.some(
      (member) => member.address.toLowerCase() === data.address.toLowerCase() && member.id !== editingMember?.id,
    );

    if (isDuplicate) {
      setFormError('This address is already a member of the council');
      return;
    }

    try {
      let userData;

      if (editingMember) {
        userData = await updateUserMutation.mutateAsync({
          id: editingMember.id,
          address: data.address,
          email: data.email,
          name: data.name,
        });
      } else {
        userData = await createUserMutation.mutateAsync(data);
        if (!userData.id) {
          throw new Error('Created user is missing ID');
        }
      }

      if (editingMember) {
        const updatedMembers = currentMembers.map((member) => (member.id === editingMember.id ? userData : member));
        parentForm.setValue('members', updatedMembers);
      } else {
        parentForm.setValue('members', [...currentMembers, userData]);
      }

      setFormError(null);
      modalForm.reset();
      onClose();
    } catch (error) {
      setFormError('Failed to save user. Please try again.');
      console.error('Error saving user:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setFormError(null);
      modalForm.reset({
        address: editingMember?.address || '',
        email: editingMember?.email || '',
        name: editingMember?.name || '',
      });
    }
  }, [isOpen, editingMember, modalForm]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='2xl'>
      <ModalOverlay className='bg-black/50' />
      <ModalContent
        as='form'
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          modalForm.handleSubmit(handleSubmit)(e);
        }}
        className='p-8'
      >
        <div className='mb-8 flex items-center justify-between'>
          <h2 className='text-2xl font-bold'>{editingMember ? 'Edit Council Member' : 'Add Council Member'}</h2>
          <button type='button' onClick={onClose} className='text-black hover:opacity-70'>
            <FiX className='h-5 w-5' />
          </button>
        </div>

        <div className='space-y-6'>
          <div className='space-y-2'>
            <label className='font-bold'>
              {selectedChain.charAt(0).toUpperCase() + selectedChain.slice(1)} Account
            </label>
            <AddressInput
              name='address'
              localForm={modalForm}
              hideAddressButtons
              chainId={chainId}
              isDisabled={!canEdit}
            />
          </div>
          <div className='space-y-2'>
            <label className='font-bold'>
              Email Address <span className='text-sm font-normal text-gray-400'>Hidden</span>
            </label>
            <Input
              name='email'
              localForm={modalForm}
              placeholder='Email that receives the council invite'
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
            <label className='font-bold'>
              Name <span className='text-sm font-normal text-gray-400'>Optional</span>
            </label>
            <Input name='name' localForm={modalForm} placeholder='Alias or name' isDisabled={!canEdit} />
          </div>
        </div>

        <div className='mt-8'>
          {formError && <p className='mb-4 text-sm text-red-500'>{formError}</p>}
          <div className='flex justify-end'>
            <NextStepButton type='submit' disabled={!canEdit || !isFormValid()} withIcon={false}>
              {editingMember ? 'Save Changes' : 'Add Member'}
            </NextStepButton>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
