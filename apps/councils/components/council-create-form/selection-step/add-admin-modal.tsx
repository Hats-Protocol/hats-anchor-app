'use client';

import { Modal, ModalContent, ModalOverlay } from '@chakra-ui/react';
import type { CouncilFormData } from 'contexts';
import { AddressInput, Input } from 'forms';
import { useEffect, useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { FiX } from 'react-icons/fi';
import { isAddress } from 'viem';

interface CouncilMember {
  address: string;
  email: string;
  name?: string;
}

interface AddAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: UseFormReturn<CouncilFormData>;
  editingAdmin?: CouncilMember | null;
}

export function AddAdminModal({
  isOpen,
  onClose,
  form: parentForm,
  editingAdmin,
}: AddAdminModalProps) {
  const selectedChain = parentForm.watch('chain');
  const chainId =
    selectedChain === 'optimism' ? 10 : selectedChain === 'base' ? 8453 : 42161;

  const modalForm = useForm({
    defaultValues: {
      address: editingAdmin?.address || '',
      email: editingAdmin?.email || '',
      name: editingAdmin?.name || '',
    },
  });

  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (data: {
    address: string;
    email: string;
    name?: string;
  }) => {
    if (!isAddress(data.address)) {
      setFormError('Please enter a valid Ethereum address');
      return;
    }

    const currentAdmins = parentForm.getValues('admins') || [];

    const isDuplicate = currentAdmins.some(
      (admin) =>
        admin.address.toLowerCase() === data.address.toLowerCase() &&
        admin.address !== editingAdmin?.address,
    );

    if (isDuplicate) {
      setFormError('This address is already an admin of the council');
      return;
    }

    if (editingAdmin) {
      const updatedAdmins = currentAdmins.map((admin) =>
        admin.address === editingAdmin.address
          ? { address: data.address, email: data.email, name: data.name }
          : admin,
      );
      parentForm.setValue('admins', updatedAdmins);
    } else {
      parentForm.setValue('admins', [
        ...currentAdmins,
        { address: data.address, email: data.email, name: data.name },
      ]);
    }

    setFormError(null);
    modalForm.reset();
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      setFormError(null);
      modalForm.reset({
        address: editingAdmin?.address || '',
        email: editingAdmin?.email || '',
        name: editingAdmin?.name || '',
      });
    }
  }, [isOpen, editingAdmin, modalForm]);

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
            {editingAdmin ? 'Edit Council Admin' : 'Add Council Admin'}
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
            placeholder='Email that receives the admin invite'
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
              {editingAdmin ? 'Save Changes' : 'Add Admin'}
            </button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
