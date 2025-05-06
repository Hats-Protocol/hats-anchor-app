'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useMutation } from '@tanstack/react-query';
import { useCouncilForm } from 'contexts';
import { Form, Input, MemberAddressInput } from 'forms';
import { useOrganization } from 'hooks';
import { useEffect, useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { CouncilFormData, CouncilMember, FormMember } from 'types';
import { Button, cn } from 'ui';
import { chainsMap, CREATE_USER, getChainId, getCouncilsGraphqlClient, isValidEmail, logger, UPDATE_USER } from 'utils';
import { isAddress } from 'viem';

import { NextStepButton } from '../../next-step-button';

interface AddMemberFormProps {
  parentForm: UseFormReturn<CouncilFormData>;
  editingMember?: CouncilMember | null;
  onClose: () => void;
  canEdit?: boolean;
  className?: string;
}

export function AddMemberForm({ parentForm, editingMember, onClose, canEdit = true, className }: AddMemberFormProps) {
  const selectedChain = parentForm.watch('chain')?.value;
  const chainId = getChainId(selectedChain);
  const { persistForm } = useCouncilForm();
  const { getAccessToken } = usePrivy();
  const organizationName = parentForm.watch('organizationName') || '';
  const orgName = typeof organizationName === 'string' ? organizationName : organizationName.value;
  const { data: organization } = useOrganization(orgName);

  // extract and flatten members from all councils
  const allMembers =
    organization?.councils?.reduce((acc: CouncilMember[], council) => {
      if (council.creationForm?.members) {
        return [...acc, ...council.creationForm.members];
      }
      return acc;
    }, []) || [];

  // remove duplicates based on member address
  const uniqueMembers = allMembers.filter(
    (member, index, self) => index === self.findIndex((m) => m.address.toLowerCase() === member.address.toLowerCase()),
  );

  const modalForm = useForm({
    defaultValues: {
      address: editingMember?.address || '',
      email: editingMember?.email || '',
      name: editingMember?.name || '',
    },
  });

  const [formError, setFormError] = useState<string | null>(null);

  const isFormValid = () => {
    const values = modalForm.getValues();
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
  });

  const updateUserMutation = useMutation({
    mutationFn: async (variables: { id: string; address: string; email: string; name?: string }) => {
      const accessToken = await getAccessToken();
      const result = await getCouncilsGraphqlClient(accessToken ?? undefined).request<{
        updateUser: CouncilMember;
      }>(UPDATE_USER, variables);
      return result.updateUser;
    },
  });

  const handleSubmit = async (data: FormMember) => {
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
      let userData: CouncilMember;

      if (editingMember) {
        userData = await updateUserMutation.mutateAsync({
          id: editingMember.id,
          address: data.address,
          email: data.email,
          name: data.name,
        });
        const updatedMembers = currentMembers.map((member) => (member.id === editingMember.id ? userData : member));
        parentForm.setValue('members', updatedMembers);
      } else {
        userData = await createUserMutation.mutateAsync(data);
        parentForm.setValue('members', [...currentMembers, userData]);
      }
      persistForm('eligibility', 'members');
      logger.debug('userData', userData);

      setFormError(null);
      modalForm.reset();
      onClose();
    } catch (error) {
      setFormError('Failed to save user. Please try again.');
      logger.error('Error saving user:', error);
    }
  };

  // Reset form when editing member changes
  useEffect(() => {
    if (editingMember) {
      setFormError(null);
      modalForm.reset({
        address: editingMember.address || '',
        email: editingMember.email || '',
        name: editingMember.name || '',
      });
    }
  }, [editingMember, modalForm]);

  return (
    <Form {...modalForm}>
      <div className={cn('space-y-6', className)}>
        <div className='space-y-6'>
          <div className='space-y-2'>
            <MemberAddressInput
              name='address'
              label={`${chainsMap(chainId).name} Account`}
              localForm={modalForm}
              chainId={chainId}
              variant='councils'
              isDisabled={!canEdit}
              members={uniqueMembers}
              onSubmit={handleSubmit}
              onClose={onClose}
            />
          </div>

          <div className='space-y-2'>
            <Input
              name='email'
              localForm={modalForm}
              label='Email Address'
              labelNote='Hidden'
              placeholder='Email that receives the member invite'
              variant='councils'
              options={{
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              }}
              isDisabled={!canEdit}
            />
          </div>

          <div className='space-y-2'>
            <Input
              name='name'
              label='Name'
              labelNote='Optional'
              variant='councils'
              localForm={modalForm}
              placeholder='Alias or name'
              isDisabled={!canEdit}
            />
          </div>
        </div>

        {formError && <p className='text-destructive text-sm'>{formError}</p>}

        <div className='flex items-center justify-between gap-3'>
          <Button
            variant='outline'
            onClick={() => {
              onClose();
              setFormError(null);
              modalForm.reset();
            }}
            type='button'
          >
            Cancel
          </Button>
          <NextStepButton
            onClick={() => modalForm.handleSubmit(handleSubmit)()}
            disabled={!canEdit || !isFormValid()}
            withIcon={false}
            type='button'
          >
            {editingMember ? 'Save Changes' : 'Add Council Member'}
          </NextStepButton>
        </div>
      </div>
    </Form>
  );
}
