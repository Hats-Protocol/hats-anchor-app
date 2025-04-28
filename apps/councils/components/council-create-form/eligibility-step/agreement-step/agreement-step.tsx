'use client';

import { hatIdDecimalToHex, hatIdIpToDecimal } from '@hatsprotocol/sdk-v1-core';
import { useCouncilForm } from 'contexts';
import { Form, MarkdownEditor, RadioCard, RadioCardOption } from 'forms';
import { filter, find, flatten, get, isEmpty, map, pick, uniqBy } from 'lodash';
import { FilePlus, FileText } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { FiUserPlus } from 'react-icons/fi';
import { IconType } from 'react-icons/lib';
// import showdown from 'showdown';
import { CouncilData, CouncilFormData, CouncilMember, StepProps } from 'types';
import { Button, Skeleton } from 'ui';
import { getKnownEligibilityModule, logger } from 'utils';
import { Hex } from 'viem';

import { NextStepButton } from '../../../next-step-button';
import { findNextInvalidStep, getNextStepButtonText } from '../../utils';
import { AgreementAdminsList } from '../agreement-admins-list';
import { UnifiedUserForm } from '../unified-user-form';
import { LoadingAgreementStep, RadioCardSkeleton } from './agreement-skeletons';

const getAdminHatId = (treeId: number | undefined): Hex | null => {
  if (!treeId) return null;
  const newHatId = `${treeId}.1`;
  return hatIdDecimalToHex(hatIdIpToDecimal(newHatId));
};

export function AgreementStep({ onNext }: StepProps) {
  const { form, isLoading, stepValidation, canEdit, councilsData } = useCouncilForm();
  logger.info('councilsData', councilsData);
  const [editingAdmin, setEditingAdmin] = useState<CouncilMember | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isMutating, setIsMutating] = useState(false);

  const agreementAdmins = form.watch('agreementAdmins') || [];
  logger.info('agreementAdmins', agreementAdmins);
  // const createAgreementAdminRole = form.watch('eligibilityRequirements.agreement.existingId');
  // logger.info('createAgreementAdminRole', createAgreementAdminRole);
  // // const admins = form.watch('admins') || []; // Don't think we need this anymore, but leaving here until the permissions are tested in QA
  // const agreement = form.watch('agreement');
  // logger.info('agreement', agreement);

  // grabs from the eligibilityRequirements object
  const eligibilityRequirements = form.watch('eligibilityRequirements');
  const { content, existingId, existingAdmins } = pick(eligibilityRequirements.agreement, [
    'content',
    'existingId',
    'existingAdmins',
  ]);

  const nextStep = findNextInvalidStep(stepValidation, 'eligibility', 'agreement', eligibilityRequirements);

  const existingAgreements = useMemo(() => {
    const rawCouncilsWithAgreements = councilsData?.map((council) => {
      return flatten(council.eligibilityRules).find(
        (rule) => getKnownEligibilityModule(rule.module.implementationAddress as Hex) === 'agreement',
      );
    });

    // getting the unique councils with agreements
    const councilsWithAgreements = uniqBy(rawCouncilsWithAgreements, 'address');

    // we want to get the councils that are associated with each agreement
    const agreementsWithCouncilData = councilsWithAgreements.map((agreement) => {
      return {
        ...agreement,
        councils: councilsData?.filter((council) =>
          map(flatten(council.eligibilityRules), 'address').includes(agreement?.address || '0x'),
        ) as CouncilData[],
      };
    });

    return agreementsWithCouncilData;
  }, [councilsData]);

  // Extract unique organization managers from existing councils
  const organizationManagers = useMemo(
    () =>
      councilsData?.reduce<CouncilMember[]>((acc, council) => {
        if (council.creationForm?.admins) {
          council.creationForm.admins.forEach((admin) => {
            if (!acc.some((existing) => existing.address.toLowerCase() === admin.address.toLowerCase())) {
              acc.push({
                ...admin,
                email: '', // Adding required email field
              });
            }
          });
        }
        return acc;
      }, []) || [],
    [councilsData],
  );

  // Group unique admin sets across councils
  const agreementAdminGroups = useMemo(() => {
    const groupsByAdmins = new Map<string, { admins: CouncilMember[]; councils: string[] }>();

    const adminHats = flatten(
      map(councilsData, (council) => {
        if (!council) return null;
        // get the associated owner hat IDs for all the modules in the council
        const rules = flatten(council.eligibilityRules);
        const params = flatten(map(rules, 'liveParams'));
        const ownerHats = filter(params, { label: 'Owner Hat' });
        return uniqBy(ownerHats, 'value');
      }),
    );
    console.log('adminHats', adminHats);

    return Object.fromEntries(groupsByAdmins.entries());
  }, [councilsData]);

  // logger.info('agreementAdminGroups', agreementAdminGroups);

  const treeId = councilsData?.[0]?.treeId;
  const adminHatId = getAdminHatId(treeId);

  // useEffect(() => {
  //   if (existingAdmins === 'org-managers') {
  //     form.setValue('agreementAdmins', organizationManagers);
  //   } else if (existingAdmins) {
  //     const adminKey = existingAdmins;
  //     const group = agreementAdminGroups[adminKey];
  //     if (group) {
  //       form.setValue('agreementAdmins', group.admins);
  //     }
  //   } else if (existingAdmins === null) {
  //     // Only clear the array if there are no existing admins
  //     const currentAdmins = form.getValues('agreementAdmins') || [];
  //     if (currentAdmins.length === 0) {
  //       form.setValue('agreementAdmins', []);
  //     }
  //   }
  // }, [existingAdmins, form, organizationManagers, agreementAdminGroups]);

  // const [selectedOption, setSelectedOption] = useState(() => {
  //   const currentAgreement = form.getValues('agreement');
  //   // Check if the current agreement matches any existing ones
  //   return existingAgreements?.some((existing) => existing.agreement === currentAgreement) ? 'existing' : 'new';
  // });

  // Create radio options from existing agreements and add the "Create new" option
  const agreementOptions = useMemo(
    () => [
      ...(existingAgreements || []).map((existingAgreement) => ({
        value: existingAgreement?.address,
        label: 'Agreement',
        icon: FileText as IconType,
        description: existingAgreement?.councils.map((council) => council.creationForm.councilName).join(', '),
        onSelect: () => {
          const existingAdmins = find(get(existingAgreement, 'liveParams'), { label: 'Owner Hat' });
          const adminsHatId = hatIdDecimalToHex(existingAdmins?.value as bigint);
          form.setValue(
            'eligibilityRequirements.agreement.existingAdmins',
            adminsHatId === adminHatId ? 'org-managers' : adminsHatId,
          );
          form.setValue(
            'eligibilityRequirements.agreement.content',
            existingAgreement?.councils?.[0]?.eligibilityRequirements?.agreement.content || '',
          );
        },
      })),
      {
        value: 'new',
        label: 'Create a new Agreement for this Council',
        icon: FilePlus as IconType,
        description: 'Write an agreement and select who controls it',
        onSelect: () => {
          // TODO check if there's an agreement in local storage and use that https://linear.app/hats-protocol/issue/BUILD-344
        },
      },
    ],
    [existingAgreements, adminHatId, form],
  );

  // Determine which radio option should be selected based on agreement value

  // Create radio options for agreement managers
  const agreementManagerOptions = useMemo(
    () => [
      {
        value: 'org-managers',
        label: 'Organization Managers',
        description: 'Manage Roles on all Councils',
        avatars: organizationManagers,
        onSelect: () => form.setValue('agreementAdmins', organizationManagers),
      },
      // ...Object.entries(filteredAgreementAdminGroups).map(([key, group]) => ({
      //   value: key!,
      //   label: 'Agreement Managers',
      //   description: `Manages ${group.councils.length} Agreement${group.councils.length > 1 ? 's' : ''} on ${group.councils.join(', ')}`,
      //   avatars: group.admins,
      //   onSelect: () => form.setValue('agreementAdmins', group.admins),
      // })),
      {
        value: 'new',
        label: 'Create new Agreement Managers',
        description: 'Create a new group of agreement managers',
        onSelect: () => form.setValue('agreementAdmins', []),
      },
    ],
    [organizationManagers, form],
  );

  // useEffect(() => {
  //   // \!selectedOption ||
  //   if (!form || !existingAgreements) return;

  //   const currentValues = form.getValues();
  //   // TODO improve match
  //   const existingAgreement = existingAgreements?.find((localAgreement) => {
  //     return trim(localAgreement.agreement) === trim(content || '');
  //   });
  //   if (existingAgreement) {
  //     form.reset({
  //       ...currentValues,
  //       // agreement: existingAgreement?.agreement || '',
  //       agreementAdmins: isEmpty(existingAgreement?.agreementAdmins)
  //         ? organizationManagers || []
  //         : existingAgreement?.agreementAdmins || [],
  //       // @ts-expect-error TODO: fix this, need to upgrade the form to use a more flexible type
  //       createAgreementAdminRole: isEmpty(existingAgreement?.agreementAdmins)
  //         ? 'false'
  //         : `existing:${existingAgreement.id}`,
  //       agreementType: existingAgreement?.agreement,
  //     });
  //     // setSelectedOption('existing');
  //   }
  // }, [existingAgreements, form, organizationManagers, agreementOptions]);

  // Show loading state during mutation or while fetching updated data
  const isLoadingList = isMutating || !isLoading;

  const handleSubmit = useCallback(
    async (data: CouncilFormData) => {
      // set the current form values to prevent state flashing during transition
      // data contains the latest form values at submission time (as we advance the form)
      form.reset(data);
      onNext();
    },
    [form, onNext],
  );

  if (isLoading) {
    return <LoadingAgreementStep />;
  }

  logger.info('agreementAdminOptions', agreementManagerOptions);

  return (
    <>
      <Form {...form}>
        <form className='mx-auto flex w-full flex-col space-y-6' onSubmit={form.handleSubmit(handleSubmit)}>
          <div className='space-y-4'>
            <div className='flex items-center gap-4'>
              <FileText />
              <h2 className='text-2xl font-bold'>Sign Agreement</h2>
            </div>
          </div>

          <div className='space-y-4'>
            <div className='flex flex-col gap-1'>
              <div className='flex items-center gap-2'>
                <h3 className='font-bold'>Which agreement should Council Members sign?</h3>
              </div>
            </div>

            {isLoading ? (
              <div className='flex flex-col gap-4'>
                <RadioCardSkeleton />
                <RadioCardSkeleton />
              </div>
            ) : (
              <RadioCard
                name='eligibilityRequirements.agreement.existingId' // TODO existingModule
                localForm={form}
                options={agreementOptions as RadioCardOption[]}
                isDisabled={!canEdit}
              />
            )}
          </div>

          <div className='space-y-4'>
            <div className='flex flex-col gap-1'>
              <div className='flex items-center gap-2'>
                <h3 className='font-bold'>Agreement Text</h3>
                <span className='text-xs text-black/60'>Optional</span>
              </div>
              <p className='text-sm text-gray-600'>
                Add an agreement that Council Members sign and abide by to be on the council.
              </p>
            </div>

            <MarkdownEditor
              name='eligibilityRequirements.agreement.content'
              localForm={form}
              // @ts-expect-error move to subforms to avoid challenges with the types between the parent and active forms
              isDisabled={existingId !== 'new'}
              placeholder='Write or paste your agreement text below in a markdown format, use the preview buttons in the toolbar.'
            />
          </div>

          <div className='space-y-8'>
            <div className='space-y-2'>
              <h2 className='font-bold'>Who manages the agreement?</h2>
              {isLoading ? (
                <div className='flex flex-col gap-4'>
                  <RadioCardSkeleton />
                  <RadioCardSkeleton />
                  <RadioCardSkeleton />
                </div>
              ) : (
                existingAdmins === null && (
                  <RadioCard
                    name='eligibilityRequirements.agreement.existingAdmins'
                    localForm={form}
                    options={agreementManagerOptions as RadioCardOption[]}
                    // @ts-expect-error move to subforms to avoid challenges with the types between the parent and active forms
                    isDisabled={!canEdit || existingId !== 'new'}
                  />
                )
              )}
            </div>

            {/* Show either Organization Managers or Agreement Managers based on selection */}
            {!isLoading && (
              <div>
                <h3 className='mb-2 font-bold'>
                  {existingAdmins === 'org-managers' ? 'Organization Managers' : 'Agreement Managers'}
                </h3>
                <p className='text-sm text-gray-600'>
                  {existingAdmins === 'org-managers' ? 'Organization' : 'Agreement'} Managers can update the agreement
                  text and verify that Council Members have signed it.
                </p>
                <div className='mt-4 space-y-4'>
                  <AgreementAdminsList
                    agreementAdmins={
                      existingAdmins === 'org-managers'
                        ? organizationManagers
                        : !isEmpty(agreementAdmins) || !existingAdmins
                          ? agreementAdmins
                          : form.getValues('admins')
                    }
                    form={form}
                    canEdit={!existingAdmins && canEdit}
                    canDelete={!existingAdmins ? canEdit : false}
                    showButtons={!existingAdmins}
                    onEdit={(admin) => {
                      setEditingAdmin(admin);
                      setShowAddForm(true);
                    }}
                    loading={isLoadingList}
                  />

                  {!showAddForm && !existingAdmins && (
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
                      Add Agreement Manager
                    </Button>
                  )}
                </div>
              </div>
            )}

            {showAddForm && (
              <div className='-mx-16 border-b border-gray-200'>
                <UnifiedUserForm
                  parentForm={form}
                  editingUser={editingAdmin}
                  userType='agreementAdmin'
                  onClose={() => {
                    setShowAddForm(false);
                    setEditingAdmin(null);
                  }}
                  canEdit={canEdit}
                  className='bg-white px-16 py-6'
                  hideAddressButtons={true}
                  onMutationStateChange={setIsMutating}
                />
              </div>
            )}
          </div>

          <div className='flex justify-end py-6'>
            <NextStepButton
              disabled={!canEdit || (!existingId && agreementAdmins.length === 0) || isLoadingList || isMutating}
            >
              {getNextStepButtonText(nextStep)}
            </NextStepButton>
          </div>
        </form>
      </Form>
    </>
  );
}
