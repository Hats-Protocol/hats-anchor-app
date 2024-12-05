'use client';

import { Modal, ModalContent, ModalOverlay } from '@chakra-ui/react';
import { AddressInput, Input } from 'forms';
import { useForm, UseFormReturn } from 'react-hook-form';
import { FiX } from 'react-icons/fi';
import { isAddress } from 'viem';
import { useEffect, useState } from 'react';
import type { CouncilFormData } from 'contexts'; // adjust the import path based on your project structure

interface CouncilMember {
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

export function AddMemberModal({
  isOpen,
  onClose,
  form: parentForm,
  editingMember,
}: AddMemberModalProps) {
  const selectedChain = parentForm.watch('chain');
  const chainId =
    selectedChain === 'optimism' ? 10 : selectedChain === 'base' ? 8453 : 42161; // Arbitrum

  const modalForm = useForm({
    defaultValues: {
      address: editingMember?.address || '',
      email: editingMember?.email || '',
      name: editingMember?.name || '',
    },
  });

  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (data: {
    address: string;
    email: string;
    name?: string;
  }) => {
    console.log('data', data);
    if (!isAddress(data.address)) {
      console.log('non valid address');
      setFormError('Please enter a valid Ethereum address');
      return;
    }

    const currentMembers = parentForm.getValues('members') || [];

    // Check for duplicate address, but ignore if we're editing the same member
    const isDuplicate = currentMembers.some(
      (member) =>
        member.address.toLowerCase() === data.address.toLowerCase() &&
        member.address !== editingMember?.address,
    );

    if (isDuplicate) {
      console.log('duplicate address');
      setFormError('This address is already a member of the council');
      return;
    }

    if (editingMember) {
      // Update existing member
      const updatedMembers = currentMembers.map((member) =>
        member.address === editingMember.address
          ? { address: data.address, email: data.email, name: data.name }
          : member,
      );
      parentForm.setValue('members', updatedMembers);
    } else {
      // Add new member
      parentForm.setValue('members', [
        ...currentMembers,
        { address: data.address, email: data.email, name: data.name },
      ]);
    }

    setFormError(null);
    modalForm.reset();
    onClose();
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
