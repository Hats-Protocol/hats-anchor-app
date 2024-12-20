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

import { UsdcIcon } from '../icons/usdc-icon';

interface PaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: UseFormReturn<CouncilFormData>;
  draftId: string;
}

const UPDATE_PAYER = `
  mutation UpdateCouncilCreationForm($id: ID!, $payer: UserInput!) {
    updateCouncilCreationForm(id: $id, payer: $payer) {
      id
      payer {
        id
        address
        email
        name
        telegram
      }
    }
  }
`;

const CREATE_USER = `
  mutation CreateUser($address: String!, $email: String!, $name: String, $telegram: String) {
    createUser(address: $address, email: $email, name: $name, telegram: $telegram) {
      id
      address
      email
      name
      telegram
    }
  }
`;

export function PaymentDetailsModal({
  isOpen,
  onClose,
  form: parentForm,
  draftId,
}: PaymentDetailsModalProps) {
  const selectedChain = parentForm.watch('chain');
  const chainId =
    selectedChain === 'optimism' ? 10 : selectedChain === 'base' ? 8453 : 42161;

  const modalForm = useForm({
    defaultValues: {
      address: '',
      email: '',
      name: '',
      telegram: '',
    },
  });

  const [formError, setFormError] = useState<string | null>(null);

  const createUserMutation = useMutation({
    mutationFn: async (variables: {
      address: string;
      email: string;
      name?: string;
      telegram?: string;
    }) => {
      const result = await councilsGraphqlClient.request<{
        createUser: {
          id: string;
          address: string;
          email: string;
          name?: string;
          telegram?: string;
        };
      }>(CREATE_USER, variables);
      return result.createUser;
    },
  });

  const updatePayerMutation = useMutation({
    mutationFn: async (variables: {
      id: string;
      payer: {
        id: string;
        address: string;
        email: string;
        name?: string;
        telegram?: string;
      };
    }) => {
      const result = await councilsGraphqlClient.request(
        UPDATE_PAYER,
        variables,
      );
      return result;
    },
  });

  const handleSubmit = async (data: {
    address: string;
    email: string;
    name?: string;
    telegram?: string;
  }) => {
    if (!isAddress(data.address)) {
      setFormError('Please enter a valid Ethereum address');
      return;
    }

    try {
      const userData = await createUserMutation.mutateAsync(data);

      await updatePayerMutation.mutateAsync({
        id: draftId,
        payer: userData,
      });

      parentForm.setValue('payer', userData);
      setFormError(null);
      modalForm.reset();
      onClose();
    } catch (error) {
      setFormError('Failed to save payment details. Please try again.');
      console.error('Error saving payment details:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setFormError(null);
      const currentPayer = parentForm.getValues('payer');
      if (currentPayer) {
        modalForm.reset({
          address: currentPayer.address,
          email: currentPayer.email,
          name: currentPayer.name,
          telegram: currentPayer.telegram,
        });
      }
    }
  }, [isOpen, parentForm, modalForm]);

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
        className='relative rounded-lg bg-white'
      >
        <div className='p-6'>
          <div className='pr-6'>
            <h2 className='text-xl font-semibold text-gray-900'>
              Invoicing Details
            </h2>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='absolute right-6 top-6 text-gray-400 hover:text-gray-500'
          >
            <span className='sr-only'>Close</span>
            <FiX className='h-6 w-6' />
          </button>
        </div>

        <div className='p-6'>
          <div className='space-y-6'>
            <div className='space-y-2'>
              <h3 className='text-base font-medium text-gray-900'>Monthly</h3>
              <p className='text-sm text-gray-600'>
                Here&apos;s some text that explains how invoices work.
              </p>
              <p className='mt-4 flex items-center gap-2 text-lg font-medium text-gray-900'>
                <UsdcIcon />
                299 USDC / month
              </p>
            </div>

            <Input
              name='email'
              label='EMAIL'
              localForm={modalForm}
              placeholder='Email address'
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
              label='YOUR NAME'
              localForm={modalForm}
              placeholder='Full name'
              options={{ required: true }}
            />

            <AddressInput
              name='address'
              label='OPTIMISM ACCOUNT'
              localForm={modalForm}
              hideAddressButtons
              chainId={chainId}
              options={{ required: true }}
            />

            <Input
              name='telegram'
              label='TELEGRAM HANDLE'
              localForm={modalForm}
              placeholder='@username'
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
                Submit details
              </button>
            </div>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
