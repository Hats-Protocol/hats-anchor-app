'use client';

import { Button } from '@chakra-ui/react';
import { Modal } from 'contexts';
import { AddressInput, Input } from 'forms';
import { useCreateOrUpdateUser } from 'hooks';
import { map, some, toLower } from 'lodash';
import { useForm } from 'react-hook-form';
import { SupportedChains } from 'types';
import { isValidEmail } from 'utils';
import { isAddress } from 'viem';

interface CouncilMemberDetails {
  address: string;
  email: string;
  name?: string;
}

interface CouncilMember extends CouncilMemberDetails {
  id: string;
}

interface UserFormProps extends CouncilMember {
  admins: CouncilMember[];
}

type AddAdminModalProps = {
  chainId: number;
  type: 'admin' | 'compliance' | 'member' | 'allowlist' | 'agreement' | 'election' | 'subscription';
  userLabel: string;
  editingAdmin?: CouncilMember | null;
};

export function AddUserModal({ chainId = 11155111, type, userLabel, editingAdmin }: AddAdminModalProps) {
  const form = useForm<UserFormProps>();
  const { getValues, setValue, setError, handleSubmit } = form;

  const isFormValid = () => {
    const values = getValues();
    return isAddress(values.address) && isValidEmail(values.email);
  };

  const { createOrUpdateUser } = useCreateOrUpdateUser({
    editingId: editingAdmin?.id,
    onAddSuccess: (userData) => {
      const currentAdmins = getValues('admins') || [];
      const updatedAdmins = map(currentAdmins, (admin: CouncilMember) =>
        admin.id === editingAdmin?.id ? userData : admin,
      );
      setValue('admins', updatedAdmins);
    },
    onEditSuccess: (userData) => {
      const currentAdmins = getValues('admins') || [];
      setValue('admins', [...currentAdmins, userData]);
    },
    onError: () => {
      setError('address', { message: 'Failed to save user. Please try again.' });
    },
  });

  const onSubmit = async (data: CouncilMemberDetails) => {
    if (!isAddress(data.address)) {
      setError('address', { message: 'Please enter a valid Ethereum address' });
      return;
    }

    const currentAdmins = getValues('admins') || [];

    const isDuplicate = some(
      currentAdmins,
      (admin: CouncilMember) => toLower(admin.address) === toLower(data.address) && admin.id !== editingAdmin?.id,
    );

    if (isDuplicate) {
      setError('address', { message: 'This address is already an admin of the council' });
      return;
    }

    createOrUpdateUser({
      ...data,
      id: editingAdmin?.id || '',
    });
  };

  // TODO reenable chain label

  return (
    <Modal name={`addUser-${type}`} title={`${editingAdmin ? 'Edit' : 'Add'} ${userLabel || 'Council Member'}`}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='space-y-6'>
          <div className='space-y-2'>
            {/* <label className='font-bold'>
              {selectedChain.charAt(0).toUpperCase() + selectedChain.slice(1)} Account
            </label> */}
            <AddressInput name='address' localForm={form} hideAddressButtons chainId={chainId as SupportedChains} />
          </div>

          <div className='space-y-2'>
            <label className='font-bold'>
              Email Address <span className='text-sm font-normal text-gray-400'>Hidden</span>
            </label>
            <Input
              name='email'
              localForm={form}
              placeholder='Email that receives the admin invite'
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
            <Input name='name' localForm={form} placeholder='Alias or name' />
          </div>
        </div>

        <div className='mt-8'>
          <div className='flex justify-end'>
            <Button type='submit' disabled={!isFormValid()} variant='primary'>
              {editingAdmin ? 'Save Changes' : `Add ${userLabel || 'Council Member'}`}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
