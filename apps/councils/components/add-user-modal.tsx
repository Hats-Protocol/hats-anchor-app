'use client';

import { Button } from '@chakra-ui/react';
import { useMutation } from '@tanstack/react-query';
import { Modal } from 'contexts';
import { AddressInput, Input } from 'forms';
import { some, toLower } from 'lodash';
import { useForm } from 'react-hook-form';
import { SupportedChains } from 'types';
import { councilsGraphqlClient } from 'utils';
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

export function AddUserModal({ chainId = 11155111, type, userLabel, editingAdmin }: AddAdminModalProps) {
  const form = useForm<UserFormProps>();
  const { getValues, setValue, setError, handleSubmit } = form;

  const isValidEmail = (email: string) => {
    return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);
  };

  const isFormValid = () => {
    const values = getValues();
    return isAddress(values.address) && isValidEmail(values.email);
  };

  const { mutateAsync: createUserMutation } = useMutation({
    mutationFn: async (variables: CouncilMember) => {
      const result = await councilsGraphqlClient.request<{
        createUser: CouncilMember;
      }>(CREATE_USER, variables);
      return result.createUser;
    },
  });

  const { mutateAsync: updateUserMutation } = useMutation({
    mutationFn: async (variables: CouncilMember) => {
      const result = await councilsGraphqlClient.request<{
        updateUser: CouncilMember;
      }>(UPDATE_USER, variables);
      return result.updateUser;
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

    try {
      let userData;

      if (editingAdmin) {
        userData = await updateUserMutation({
          id: editingAdmin.id,
          address: data.address,
          email: data.email,
          name: data.name,
        });
      } else {
        userData = await createUserMutation(data as CouncilMember);
      }

      if (editingAdmin) {
        const updatedAdmins = currentAdmins.map((admin: any) => (admin.id === editingAdmin.id ? userData : admin));
        setValue('admins', updatedAdmins);
      } else {
        setValue('admins', [...currentAdmins, userData]);
      }
    } catch (error) {
      setError('address', { message: 'Failed to save user. Please try again.' });
      console.error('Error saving user:', error);
    }
  };

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
