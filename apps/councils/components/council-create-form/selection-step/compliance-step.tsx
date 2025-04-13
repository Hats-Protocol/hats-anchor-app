'use client';

import { useCouncilForm, useOverlay } from 'contexts';
import { Form, RadioBox, RadioCard } from 'forms';
import { useOrganization } from 'hooks';
import { useEffect, useRef, useState } from 'react';
import { BsPersonCheck } from 'react-icons/bs';
import { FiUserPlus } from 'react-icons/fi';
import { CouncilMember, StepProps } from 'types';
import { Button, MemberAvatar, Skeleton } from 'ui';
import { logger } from 'utils';

import { NextStepButton } from '../../next-step-button';
import { findNextInvalidStep, getNextStepButtonText } from '../utils';
import { ComplianceList } from './compliance-list';
import { UnifiedUserForm } from './unified-user-form';

export function SelectionComplianceStep({ onNext }: StepProps) {
  const { form, isLoading, stepValidation, canEdit } = useCouncilForm();
  const { setModals } = useOverlay();
  const [editingAdmin, setEditingAdmin] = useState<CouncilMember | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const prevRole = useRef(form.getValues('createComplianceAdminRole'));

  const organizationName = form.watch('organizationName') || '';
  const orgName = typeof organizationName === 'string' ? organizationName : organizationName.value;
  const { data: organization } = useOrganization(orgName);
  const createComplianceAdminRole = form.watch('createComplianceAdminRole');
  const complianceAdmins = form.watch('complianceAdmins') || [];

  // Extract unique organization managers from existing councils
  const organizationManagers =
    organization?.councils?.reduce<CouncilMember[]>((acc, council) => {
      if (council.creationForm?.admins) {
        council.creationForm.admins.forEach((admin) => {
          if (!acc.some((existing) => existing.address.toLowerCase() === admin.address.toLowerCase())) {
            acc.push(admin);
          }
        });
      }
      return acc;
    }, []) || [];

  // Group unique compliance admin sets across councils
  const complianceAdminGroups =
    organization?.councils?.reduce<{
      [key: string]: { admins: CouncilMember[]; councils: string[] };
    }>((acc, council) => {
      if (!council.creationForm?.complianceAdmins) return acc;

      // Create a sorted string of admin addresses as a key
      const complianceAdminKey = council.creationForm.complianceAdmins
        .map((admin) => admin.address.toLowerCase())
        .sort()
        .join(',');

      if (!acc[complianceAdminKey]) {
        acc[complianceAdminKey] = {
          admins: council.creationForm.complianceAdmins.map((admin) => ({
            ...admin,
            email: '', // Adding required email field
          })) as CouncilMember[],
          councils: [council.creationForm.councilName],
        };
      } else {
        acc[complianceAdminKey].councils.push(council.creationForm.councilName);
      }
      return acc;
    }, {}) || {};

  // Create radio options for compliance managers
  const complianceManagerOptions = [
    {
      value: 'false',
      label: 'Organization Managers',
      description: 'Manage Roles on all Councils',
      avatars: organizationManagers,
      onSelect: () => form.setValue('complianceAdmins', organizationManagers),
    },
    ...Object.entries(complianceAdminGroups).map(([key, group]) => ({
      value: `existing:${key}`,
      label: 'Compliance Managers',
      description: `Manages ${group.councils.length} Compliance Check${group.councils.length > 1 ? 's' : ''} on ${group.councils.join(', ')}`,
      avatars: group.admins,
      onSelect: () => form.setValue('complianceAdmins', group.admins),
    })),
    {
      value: 'true',
      label: 'Create new Compliance Managers',
      description: 'Create a new group of Compliance Managers',
      onSelect: () => form.setValue('complianceAdmins', []),
    },
  ];

  useEffect(() => {
    if (prevRole.current !== createComplianceAdminRole) {
      if (createComplianceAdminRole === 'false') {
        form.setValue('complianceAdmins', organizationManagers);
      } else if (createComplianceAdminRole.startsWith('existing:')) {
        const adminKey = createComplianceAdminRole.split(':')[1];
        const group = complianceAdminGroups[adminKey];
        if (group) {
          form.setValue('complianceAdmins', group.admins);
        }
      } else if (createComplianceAdminRole === 'true') {
        form.setValue('complianceAdmins', []);
      }
      prevRole.current = createComplianceAdminRole;
    }
  }, [createComplianceAdminRole, form, organizationManagers, complianceAdminGroups]);

  const nextStep = findNextInvalidStep(stepValidation, 'selection', 'compliance', form.watch('requirements'));

  if (isLoading) {
    return <Skeleton className='h-full w-full' />;
  }

  return (
    <>
      <Form {...form}>
        <form className='mx-auto flex w-full flex-col space-y-6' onSubmit={form.handleSubmit(onNext)}>
          <div className='flex items-center gap-4'>
            <BsPersonCheck className='h-6 w-6' />
            <h2 className='text-2xl font-bold'>Configure Compliance Requirement</h2>
          </div>

          <div>
            <p className='text-sm'>
              Require that Council Members pass a compliance check (such as KYC) before being allowed to join the
              Council. Compliance checks are handled by the provider of your choosing outside of Hats Pro, then verified
              (and revoked) via onchain transactions.
            </p>
          </div>

          <div className='space-y-8'>
            <div className='space-y-2'>
              <h2 className='font-bold'>Who does the compliance check?</h2>
              <RadioCard
                name='createComplianceAdminRole'
                localForm={form}
                options={complianceManagerOptions}
                isDisabled={!canEdit}
              />
            </div>

            <div>
              <h3 className='mb-2 font-medium'>Compliance Managers</h3>
              <p className='text-sm'>
                Compliance Managers can verify the compliance of Council Members before they join the council and remove
                members who are no longer compliant.
              </p>
              <div className='mt-4 space-y-4'>
                <ComplianceList
                  complianceAdmins={complianceAdmins}
                  form={form}
                  canEdit={createComplianceAdminRole === 'true' && canEdit}
                  canDelete={createComplianceAdminRole === 'true' ? canEdit : false}
                  showButtons={true}
                  onEdit={(admin) => {
                    setEditingAdmin(admin);
                    setShowAddForm(true);
                  }}
                />

                {createComplianceAdminRole === 'true' && !showAddForm && (
                  <Button
                    variant='outline-blue'
                    rounded='full'
                    onClick={() => {
                      setEditingAdmin(null);
                      setShowAddForm(true);
                    }}
                    disabled={!canEdit}
                    type='button'
                  >
                    <FiUserPlus className='mr-2 h-4 w-4' />
                    Add Compliance Manager
                  </Button>
                )}
              </div>
            </div>

            {createComplianceAdminRole === 'true' && showAddForm && (
              <div className='-mx-16 border-b border-gray-200'>
                <UnifiedUserForm
                  parentForm={form}
                  editingUser={editingAdmin}
                  userType='complianceAdmin'
                  onClose={() => {
                    setShowAddForm(false);
                    setEditingAdmin(null);
                  }}
                  canEdit={canEdit}
                  className='bg-white px-16 py-6'
                />
              </div>
            )}
          </div>

          <div className='flex justify-end py-6'>
            <NextStepButton
              disabled={
                !form.formState.isValid ||
                (createComplianceAdminRole === 'true' && complianceAdmins.length === 0) ||
                !canEdit
              }
            >
              {getNextStepButtonText(nextStep)}
            </NextStepButton>
          </div>
        </form>
      </Form>
    </>
  );
}
