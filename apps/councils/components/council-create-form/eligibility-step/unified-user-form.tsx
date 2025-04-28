'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useMutation } from '@tanstack/react-query';
import { useCouncilForm } from 'contexts';
import { Form, Input, MemberAddressInput } from 'forms';
import { useOrganization } from 'hooks';
import { useEffect, useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { CouncilFormData, CouncilMember } from 'types';
import { Button, cn } from 'ui';
import {
  chainsMap,
  CREATE_USER,
  getChainId,
  getCouncilsGraphqlClient,
  getOrganizationByName,
  isValidEmail,
  logger,
  UPDATE_USER,
} from 'utils';
import { isAddress } from 'viem';

import { NextStepButton } from '../../next-step-button';

type UserType = 'member' | 'admin' | 'agreementAdmin' | 'complianceAdmin';

interface UnifiedUserFormProps {
  parentForm: UseFormReturn<CouncilFormData>;
  editingUser?: CouncilMember | null;
  userType: UserType;
  onClose?: () => void;
  canEdit?: boolean;
  className?: string;
  hideAddressButtons?: boolean;
  onMutationStateChange?: (isLoading: boolean) => void;
}

const USER_TYPE_CONFIG = {
  member: {
    formField: 'members',
    persistStep: 'members',
    duplicateMessage: 'This address is already a member of the council',
    buttonText: 'Council Member',
    emailPlaceholder: 'Email that receives the member invite',
  },
  admin: {
    formField: 'admins',
    persistStep: 'management',
    duplicateMessage: 'This address is already an admin of the council',
    buttonText: 'Council Manager',
    emailPlaceholder: 'Email that receives the admin invite',
  },
  agreementAdmin: {
    formField: 'agreementAdmins',
    persistStep: 'agreement',
    duplicateMessage: 'This address is already an agreement manager',
    buttonText: 'Manager',
    emailPlaceholder: 'Email that receives the invite',
  },
  complianceAdmin: {
    formField: 'complianceAdmins',
    persistStep: 'compliance',
    duplicateMessage: 'This address is already a compliance manager',
    buttonText: 'Compliance Manager',
    emailPlaceholder: 'Email that receives the invite',
  },
} as const;

export function UnifiedUserForm({
  parentForm,
  editingUser,
  userType,
  onClose,
  canEdit = true,
  className,
  hideAddressButtons = false,
  onMutationStateChange,
}: UnifiedUserFormProps) {
  const selectedChain = parentForm.watch('chain')?.value;
  const chainId = getChainId(selectedChain);
  const { persistForm } = useCouncilForm();
  const { getAccessToken } = usePrivy();
  const organizationName = parentForm.watch('organizationName') || '';
  const orgName = typeof organizationName === 'string' ? organizationName : organizationName.value;
  const { data: organization, refetch } = useOrganization(orgName);

  // Extract and flatten members from all councils
  const allMembers =
    organization?.councils?.reduce((acc: CouncilMember[], council) => {
      if (council.creationForm?.members) {
        return [...acc, ...council.creationForm.members];
      }
      return acc;
    }, []) || [];

  // Remove duplicates based on member address
  const uniqueMembers = allMembers.filter(
    (member, index, self) => index === self.findIndex((m) => m.address.toLowerCase() === member.address.toLowerCase()),
  );

  const form = useForm({
    defaultValues: {
      address: editingUser?.address || '',
      email: editingUser?.email || '',
      name: editingUser?.name || '',
    },
  });

  const [formError, setFormError] = useState<string | null>(null);

  const isFormValid = () => {
    const values = form.getValues();
    return isAddress(values.address) && isValidEmail(values.email);
  };

  const createUserMutation = useMutation({
    mutationFn: async (variables: { address: string; email: string; name?: string }) => {
      const accessToken = await getAccessToken();
      const result = await getCouncilsGraphqlClient(accessToken ?? undefined).request<{
        createUser: CouncilMember;
      }>(CREATE_USER, variables);
      return result.createUser;
    },
    onMutate: async () => {
      onMutationStateChange?.(true);
      await refetch();
    },
    onSuccess: async (data) => {
      const config = USER_TYPE_CONFIG[userType];
      const currentUsers = parentForm.getValues(config.formField) || [];
      parentForm.setValue(config.formField, [...currentUsers, data]);
      await persistForm('selection', config.persistStep);
      setFormError(null);
      form.reset();
      onClose?.();
    },
    onError: (error) => {
      setFormError('Failed to save user. Please try again.');
      logger.error('Error saving user:', error);
    },
    onSettled: () => {
      onMutationStateChange?.(false);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (variables: { id: string; address: string; email: string; name?: string }) => {
      const accessToken = await getAccessToken();
      const result = await getCouncilsGraphqlClient(accessToken ?? undefined).request<{
        updateUser: CouncilMember;
      }>(UPDATE_USER, variables);
      return result.updateUser;
    },
    onMutate: () => {
      onMutationStateChange?.(true);
    },
    onSuccess: async (data) => {
      const config = USER_TYPE_CONFIG[userType];
      const currentUsers = parentForm.getValues(config.formField) || [];
      const updatedUsers = currentUsers.map((user) => (user.id === editingUser?.id ? data : user));
      logger.info('updatedUsers', updatedUsers);
      parentForm.setValue(config.formField, updatedUsers);
      persistForm('selection', config.persistStep);
      setFormError(null);
      form.reset();
      onClose?.();
    },
    onError: (error) => {
      setFormError('Failed to save user. Please try again.');
      logger.error('Error saving user:', error);
    },
    onSettled: () => {
      onMutationStateChange?.(false);
    },
  });

  const handleSubmit = async (data: { address: string; email: string; name?: string }) => {
    if (!canEdit) return;

    if (!isAddress(data.address)) {
      setFormError('Please enter a valid Ethereum address');
      return;
    }

    const config = USER_TYPE_CONFIG[userType];
    const currentUsers = parentForm.getValues(config.formField) || [];
    const isDuplicate = currentUsers.some(
      (user) => user.address.toLowerCase() === data.address.toLowerCase() && user.id !== editingUser?.id,
    );

    if (isDuplicate) {
      setFormError(config.duplicateMessage);
      return;
    }

    try {
      if (editingUser) {
        await updateUserMutation.mutateAsync({
          id: editingUser.id,
          address: data.address,
          email: data.email,
          name: data.name,
        });
      } else {
        await createUserMutation.mutateAsync(data);
      }
    } catch (error) {
      // Error handling is done in mutation callbacks
    }
  };

  useEffect(() => {
    setFormError(null);
    form.reset({
      address: editingUser?.address || '',
      email: editingUser?.email || '',
      name: editingUser?.name || '',
    });
  }, [editingUser, form]);

  const config = USER_TYPE_CONFIG[userType];

  return (
    <Form {...form}>
      <div className={cn('space-y-6', className)}>
        <div className='space-y-6'>
          <div className='space-y-2'>
            <MemberAddressInput
              name='address'
              label={`${chainsMap(chainId).name} Account`}
              variant='councils'
              localForm={form}
              chainId={chainId}
              isDisabled={!canEdit}
              members={uniqueMembers}
              onSubmit={handleSubmit}
              onClose={onClose}
            />
          </div>

          <div className='space-y-2'>
            <Input
              name='email'
              label='Email Address'
              labelNote='Hidden'
              variant='councils'
              localForm={form}
              placeholder={config.emailPlaceholder}
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
            <Input
              name='name'
              label='Name'
              labelNote='Optional'
              variant='councils'
              localForm={form}
              placeholder='Alias or name'
              isDisabled={!canEdit}
            />
          </div>
        </div>

        <div className='mt-8'>
          {formError && <p className='mb-4 text-sm text-red-500'>{formError}</p>}
          <div className='flex justify-end gap-4'>
            {onClose && (
              <Button
                variant='outline'
                onClick={() => {
                  onClose();
                  setFormError(null);
                  form.reset();
                }}
                type='button'
              >
                Cancel
              </Button>
            )}
            <NextStepButton
              onClick={() => form.handleSubmit(handleSubmit)()}
              disabled={!canEdit || !isFormValid()}
              withIcon={false}
              type='button'
            >
              {editingUser ? 'Save Changes' : `Add ${config.buttonText}`}
            </NextStepButton>
          </div>
        </div>
      </div>
    </Form>
  );
}
