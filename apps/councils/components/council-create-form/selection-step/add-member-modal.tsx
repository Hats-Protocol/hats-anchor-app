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
}: AddMemberModalProps) {
  const selectedChain = parentForm.watch('chain');
  const chainId =
    selectedChain === 'optimism' ? 10 : selectedChain === 'base' ? 8453 : 42161;

  const modalForm = useForm({
    defaultValues: {
      address: editingMember?.address || '',
      email: editingMember?.email || '',
      name: editingMember?.name || '',
    },
  });

  const [formError, setFormError] = useState<string | null>(null);

  const createUserMutation = useMutation({
    mutationFn: async (variables: {
      address: string;
      email: string;
      name?: string;
    }) => {
      const result = await councilsGraphqlClient.request<{
        createUser: CouncilMember;
      }>(CREATE_USER, variables);
      return result.createUser;
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (variables: {
      id: string;
      address: string;
      email: string;
      name?: string;
    }) => {
      const result = await councilsGraphqlClient.request<{
        updateUser: CouncilMember;
      }>(UPDATE_USER, variables);
      return result.updateUser;
    },
  });

  const handleSubmit = async (data: {
    address: string;
    email: string;
    name?: string;
  }) => {
    if (!isAddress(data.address)) {
      setFormError('Please enter a valid Ethereum address');
      return;
    }

    const currentMembers = parentForm.getValues('members') || [];

    const isDuplicate = currentMembers.some(
      (member) =>
        member.address.toLowerCase() === data.address.toLowerCase() &&
        member.id !== editingMember?.id,
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
          ...data,
        });
      } else {
        userData = await createUserMutation.mutateAsync(data);
      }

      if (editingMember) {
        const updatedMembers = currentMembers.map((member) =>
          member.id === editingMember.id ? userData : member,
        );
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

  // Reset form when modal opens
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
          <h2 className='text-2xl'>
            {editingMember ? 'Edit Council Member' : 'Add Council Member'}
          </h2>
          <button
            type='button'
            onClick={onClose}
            className='text-black hover:opacity-70'
          >
            <FiX className='h-6 w-6' />
          </button>
        </div>

        <div className='space-y-6'>
          <AddressInput
            name='address'
            label='OPTIMISM ACCOUNT'
            localForm={modalForm}
            hideAddressButtons
            chainId={chainId}
            options={{
              required: true,
            }}
          />

          <Input
            name='email'
            label='EMAIL ADDRESS'
            localForm={modalForm}
            placeholder='Email that receives the council invite'
            options={{
              required: true,
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            }}
          />

          <Input
            name='name'
            label='NAME'
            localForm={modalForm}
            placeholder='Alias or name'
          />
        </div>

        <div className='mt-8'>
          {formError && (
            <p className='mb-4 text-sm text-red-500'>{formError}</p>
          )}
          <div className='flex justify-end'>
            <button
              type='submit'
              disabled={!modalForm.formState.isValid}
              className='rounded-lg bg-blue-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50'
            >
              {editingMember ? 'Save Changes' : 'Add Member'}
            </button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
