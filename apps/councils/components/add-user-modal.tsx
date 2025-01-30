'use client';

import { usePrivy } from '@privy-io/react-auth';
import { Modal } from 'contexts';
import { AddressInput, Form, Input } from 'forms';
import { useCreateOrUpdateUser } from 'hooks';
import { capitalize, isEmpty, keys, map, some, toLower } from 'lodash';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { SupportedChains } from 'types';
import { Button } from 'ui';
import { chainsMap, isValidEmail, logger } from 'utils';
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
  type: 'admin' | 'member' | 'complianceAdmin' | 'allowlistAdmin' | 'agreementAdmin'; // future | 'election' | 'subscription';
  userLabel: string;
  editingUser?: CouncilMember | null;
  afterSuccess?: (user: CouncilMember | undefined) => Promise<void> | Promise<(() => void) | undefined>;
  councilId: string | undefined; // Specifically the `creationForm.id`
  existingUsers: CouncilMember[];
  addUserLoading?: [boolean, (isLoading: boolean) => void];
};

function AddUserModal({
  chainId = 11155111,
  type,
  userLabel,
  editingUser,
  afterSuccess,
  councilId,
  existingUsers,
  addUserLoading,
}: AddAdminModalProps) {
  const [isLoading, setIsLoading] = addUserLoading || [false, () => {}];
  const { user } = usePrivy();
  const form = useForm<UserFormProps>();
  const {
    getValues,
    setValue,
    setError,
    handleSubmit,
    reset,
    formState: { dirtyFields },
  } = form;
  const isDirty = !isEmpty(keys(dirtyFields));

  const isFormValid = () => {
    const values = getValues();
    // TODO use yup resolvers
    return isAddress(values.address) && isValidEmail(values.email);
  };

  const { createOrUpdateUser } = useCreateOrUpdateUser({
    editingId: editingUser?.id,
    councilId,
    memberType: type as 'admin' | 'complianceAdmin' | 'member' | 'agreementAdmin', // TODO breakout this type
    existingUsers,
    onAddSuccess: (userData) => {
      // TODO handle the correct type here
      const currentAdmins = getValues('admins') || [];
      const updatedAdmins = map(currentAdmins, (admin: CouncilMember) =>
        admin.id === editingUser?.id ? userData : admin,
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

  useEffect(() => {
    if (!editingUser) {
      reset();
      return;
    }

    reset({
      address: editingUser.address,
      email: editingUser.email,
      name: editingUser.name,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingUser]);

  const onSubmit = async (data: CouncilMemberDetails) => {
    setIsLoading(true);
    if (!isAddress(data.address)) {
      setError('address', { message: 'Please enter a valid Ethereum address' });
      return;
    }

    // TODO generic check for duplicate (remove "admins" literal)
    const currentAdmins = getValues('admins') || [];

    const isDuplicate = some(
      currentAdmins,
      (admin: CouncilMember) => toLower(admin.address) === toLower(data.address) && admin.id !== editingUser?.id,
    );

    if (isDuplicate) {
      setError('address', { message: 'This address is already an admin of the council' });
      return;
    }

    const createdOrUpdatedUser = await createOrUpdateUser({
      ...data,
      id: editingUser?.id || '',
    });
    logger.info('createdOrUpdatedUser', createdOrUpdatedUser);

    afterSuccess?.(createdOrUpdatedUser);
  };

  return (
    <Modal
      name={editingUser ? `editUser-${type}-${editingUser.address}` : `addUser-${type}`}
      title={`${editingUser ? 'Edit' : 'Add'} ${userLabel || 'Council Member'}`}
    >
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='space-y-6'>
            <div className='space-y-2'>
              <label className='font-bold'>{capitalize(chainsMap(chainId).name)} Account</label>
              <AddressInput name='address' localForm={form} hideAddressButtons chainId={chainId as SupportedChains} />
            </div>

            <div className='space-y-2'>
              <label className='font-bold'>
                Email Address <span className='ml-1 text-xs font-normal text-gray-400'>Hidden</span>
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
                Name <span className='ml-1 text-xs font-normal text-gray-400'>Optional</span>
              </label>
              <Input name='name' localForm={form} placeholder='Alias or name' readOnly={!user} />
            </div>
          </div>

          <div className='mt-8'>
            <div className='flex justify-end'>
              {editingUser ? (
                <Button type='submit' rounded='full' disabled={!isFormValid() || isLoading || !isDirty}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              ) : (
                <Button type='submit' rounded='full' disabled={!isFormValid() || isLoading}>
                  {isLoading ? 'Adding...' : `Add ${userLabel || 'Council Member'}`}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </Modal>
  );
}

export { AddUserModal };
