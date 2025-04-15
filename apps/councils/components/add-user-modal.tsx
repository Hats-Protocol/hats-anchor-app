'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useQueryClient } from '@tanstack/react-query';
import { Modal, useOverlay } from 'contexts';
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

type AddUserModalProps = {
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
}: AddUserModalProps) {
  const [isLoading, setIsLoading] = addUserLoading || [false, () => {}];
  const { user } = usePrivy();
  const { setModals, modals } = useOverlay();
  const queryClient = useQueryClient();
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

  const handleClose = () => {
    form.clearErrors();
    reset();
    setModals?.({});
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
    const modalName = editingUser ? `editUser-${type}-${editingUser.address}` : `addUser-${type}`;

    if (modals?.[modalName]) {
      reset({
        address: editingUser?.address || '',
        email: editingUser?.email || '',
        name: editingUser?.name || '',
      });
      form.clearErrors();
    } else if (!editingUser) {
      reset();
      form.clearErrors();
    }
  }, [modals, editingUser, type, reset, form]);

  const onSubmit = async (data: CouncilMemberDetails) => {
    setIsLoading(true);
    if (!isAddress(data.address)) {
      setError('address', { message: 'Please enter a valid Ethereum address' });
      setIsLoading(false);
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
      setIsLoading(false);
      return;
    }

    try {
      const createdOrUpdatedUser = await createOrUpdateUser({
        ...data,
        id: editingUser?.id || '',
      });

      if (afterSuccess) {
        await afterSuccess(createdOrUpdatedUser);
      }

      form.clearErrors();
      form.reset();
      setIsLoading(false);
      setModals?.({});
      queryClient.invalidateQueries({ queryKey: ['councilDetails'] });
    } catch (error) {
      logger.error('Error saving user:', error);
      setError('address', { message: 'Failed to save user. Please try again.' });
      setIsLoading(false);
    }
  };

  return (
    <Modal
      name={editingUser ? `editUser-${type}-${editingUser.address}` : `addUser-${type}`}
      title={`${editingUser ? 'Edit' : 'Add'} ${userLabel || 'Council Member'}`}
      size='lg'
      onClose={handleClose}
    >
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='space-y-6'>
            <div className='space-y-2'>
              <label className='font-bold'>{capitalize(chainsMap(chainId).name)} Account</label>
              <AddressInput
                name='address'
                localForm={form}
                hideAddressButtons
                chainId={chainId as SupportedChains}
                variant='councils'
              />
            </div>

            <div className='space-y-2'>
              <Input
                name='email'
                label='Email Address'
                labelNote='Hidden'
                variant='councils'
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
              <Input
                name='name'
                label='Name'
                labelNote='Optional'
                variant='councils'
                localForm={form}
                placeholder='Alias or name'
                readOnly={!user}
              />
            </div>
          </div>

          <div className='mt-8'>
            <div className='flex justify-end'>
              {editingUser ? (
                <Button type='submit' rounded='full' disabled={!isFormValid() || isLoading || !isDirty}>
                  {isLoading ? 'Saving…' : 'Save Changes'}
                </Button>
              ) : (
                <Button type='submit' rounded='full' disabled={!isFormValid() || isLoading}>
                  {isLoading ? 'Adding…' : `Add ${userLabel || 'Council Member'}`}
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
