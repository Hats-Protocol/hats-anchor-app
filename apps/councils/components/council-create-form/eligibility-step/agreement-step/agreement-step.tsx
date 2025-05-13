'use client';

import { hatIdDecimalToHex, hatIdHexToDecimal, hatIdIpToDecimal } from '@hatsprotocol/sdk-v1-core';
import { useCouncilForm } from 'contexts';
import { Form, MarkdownEditor, RadioCard, RadioCardOption } from 'forms';
import { compact, filter, find, flatten, get, map, pick, reject, uniq, uniqBy } from 'lodash';
import { FilePlus, FileText } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiUserPlus } from 'react-icons/fi';
import { IconType } from 'react-icons/lib';
import { CouncilData, CouncilFormData, CouncilMember, StepProps } from 'types';
import { Button } from 'ui';
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
  // const { watch: councilFormWatch, getValues: councilFormGetValues, reset: councilFormReset } = councilForm;
  // const localForm = useForm();
  // const { setValue, handleSubmit, reset, watch } = localForm;

  const [editingAdmin, setEditingAdmin] = useState<CouncilMember | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isMutating, setIsMutating] = useState(false);

  const agreementAdmins = form.watch('agreementAdmins') || [];
  logger.info('agreementAdmins', agreementAdmins);

  // grabs from the eligibilityRequirements object
  const eligibilityRequirements = form.watch('eligibilityRequirements');
  const { content, existingId, existingAdmins } = pick(eligibilityRequirements.agreement, [
    'content',
    'existingId',
    'existingAdmins',
  ]);

  // const localExistingId = form.watch('eligibilityRequirements.agreement.existingId');
  // const localExistingAdmins = form.watch('eligibilityRequirements.agreement.existingAdmins');
  // logger.info('localExistingId', localExistingId);
  // Add useEffect to set initial values when component mounts // TODO: Come back to this, causing error in the context
  // useEffect(() => {
  //   if (isLoading) return;

  //   const { agreement } = eligibilityRequirements;
  //   const initialValues: Omit<Partial<CouncilFormData>, 'existingId'> = {
  //     eligibilityRequirements: {
  //       agreement: {
  //         // @ts-expect-error move to subforms to avoid challenges with the types between the parent and active forms
  //         existingId: agreement.existingId || 'new',
  //         existingAdmins: agreement.existingAdmins || null,
  //         content: agreement.content || '',
  //       },
  //     },
  //     agreementAdmins: agreement.existingAdmins ? [] : agreementAdmins,
  //   };

  //   form.reset(initialValues);
  // }, [isLoading, eligibilityRequirements]);

  const nextStep = findNextInvalidStep(stepValidation, 'eligibility', 'agreement', eligibilityRequirements);

  const existingAgreements = useMemo(() => {
    const rawCouncilsWithAgreements = councilsData?.map((council) => {
      return flatten(council.eligibilityRules).find(
        // TODO ignore councils without eligibility rules?
        (rule) => getKnownEligibilityModule(rule.module.implementationAddress as Hex) === 'agreement',
      );
    });

    // getting the unique councils with agreements
    const councilsWithAgreements = uniqBy(rawCouncilsWithAgreements, 'address');

    // we want to get the councils that are associated with each agreement
    const agreementsWithCouncilData = councilsWithAgreements.map((agreement) => {
      if (!agreement) return null;
      return {
        ...agreement,
        councils: councilsData?.filter((council) =>
          map(flatten(council.eligibilityRules), 'address').includes(agreement?.address || '0x'),
        ) as CouncilData[],
      };
    });

    return compact(agreementsWithCouncilData);
  }, [councilsData]);

  // Extract unique organization managers from existing councils and set to admins if councilsData is undefined (fresh org)
  const organizationManagers = useMemo(() => {
    // Guard against form not being ready
    if (isLoading) {
      return [];
    }

    const formAdmins = form.getValues('admins') || [];

    if (!councilsData) {
      return formAdmins.map((admin) => ({
        ...admin,
        email: '', // Adding required email field
      }));
    }

    const uniqueAdmins = councilsData.reduce<CouncilMember[]>((acc, council) => {
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
    }, []);

    return uniqueAdmins.length > 0
      ? uniqueAdmins
      : formAdmins.map((admin) => ({
          ...admin,
          email: '', // Adding required email field
        }));
  }, [councilsData, form, isLoading]);

  const treeId = councilsData?.[0]?.treeId;
  const adminHatId = getAdminHatId(treeId);

  // Group unique admin sets across councils
  const agreementAdminGroups = useMemo(() => {
    if (!adminHatId) return [];
    const adminHats = flatten(
      map(councilsData, (council) => {
        if (!council) return null;
        // get the associated owner hat IDs for all the modules in the council
        const rules = flatten(council.eligibilityRules); //flatten rules per council
        const params = flatten(map(rules, 'liveParams')); // grab the params
        const ownerHats = filter(params, { label: 'Owner Hat' }); // look for the Owner Hat
        return uniq(map(ownerHats, 'value'));
      }),
    );

    const filteredAdminHats = reject(adminHats, (hatValue) => hatValue === hatIdHexToDecimal(adminHatId));

    const preExistingOptions = map(filteredAdminHats, (hatValue) => {
      const councilsByHatId = councilsData?.filter((council) => {
        const rules = flatten(council.eligibilityRules);
        const params = flatten(map(rules, 'liveParams'));
        const ownerHats = filter(params, { label: 'Owner Hat' });
        return ownerHats.some((hat) => hat?.value === hatValue);
      });

      const councilsByHatIdWithAgreementModule = councilsByHatId?.map((council) =>
        flatten(council?.eligibilityRules)?.find((rule) => rule.liveParams?.some((param) => param.value === hatValue)),
      );

      const moduleEligibilityRules = councilsByHatIdWithAgreementModule?.map((rule) =>
        getKnownEligibilityModule(rule?.module.implementationAddress as Hex),
      );

      const avatars = moduleEligibilityRules?.includes('allowlist')
        ? flatten(councilsByHatId?.map((council) => council.creationForm.complianceAdmins))
        : flatten(councilsByHatId?.map((council) => council.creationForm.agreementAdmins));

      const label = moduleEligibilityRules?.includes('allowlist')
        ? `Compliance Manager${avatars?.length > 1 ? 's' : ''}`
        : `Agreement Manager${avatars?.length > 1 ? 's' : ''}`;

      const descriptionNames = councilsByHatId?.map((council) => council.creationForm.councilName).join(', ');
      const councilsCount = councilsByHatId?.length || 0;

      const description = moduleEligibilityRules?.includes('allowlist')
        ? `Manages Compliance for ${descriptionNames}`
        : `Manages ${councilsCount > 1 ? councilsCount + ' Agreements' : ' Agreement'} for ${descriptionNames}`;

      return {
        value: hatIdDecimalToHex(hatValue),
        label,
        description,
        avatars,
        onSelect: () => form.setValue('agreementAdmins', avatars),
      };
    });

    return uniqBy(preExistingOptions, 'value');
  }, [councilsData]);
  console.log('existingAgreements', existingAgreements);

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
          const adminsHatId = existingAdmins?.value ? hatIdDecimalToHex(existingAdmins?.value as bigint) : null;
          form.setValue(
            'eligibilityRequirements.agreement.existingAdmins',
            adminsHatId === adminHatId ? 'org-managers' : adminsHatId,
          );
          form.setValue(
            'eligibilityRequirements.agreement.content',
            existingAgreement?.councils?.[0]?.eligibilityRequirements?.agreement.content || '',
          );
          form.setValue(
            'agreementAdmins',
            adminsHatId === adminHatId
              ? organizationManagers
              : existingAgreement?.councils?.[0]?.creationForm?.agreementAdmins || [],
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
          // form.setValue('eligibilityRequirements.agreement.existingId', 'new');
        },
      },
    ],
    [existingAgreements, adminHatId, form, organizationManagers],
  );

  // Create radio options for agreement managers
  // Add back in the agreement managers options using the same pattern
  // Set the admins themselves since this is hidden -- check the loading state for the list
  const agreementManagerOptions = useMemo(
    () => [
      {
        value: 'org-managers',
        label: `Organization Manager${organizationManagers?.length > 1 ? 's' : ''}`,
        description: 'Manage Roles on all Councils',
        avatars: organizationManagers,
        onSelect: () => form.setValue('agreementAdmins', organizationManagers),
      },
      ...agreementAdminGroups,
      {
        value: 'new',
        label: 'Create new Agreement Manager Role',
        description: 'Agreement Managers control the conetnt of the agreement and adherence',
        onSelect: () => form.setValue('agreementAdmins', []),
      },
    ],
    [organizationManagers, form],
  );

  // Show loading state during mutation or while fetching updated data
  const isLoadingList = isMutating || isLoading;

  // Set initial selection to first existing agreement if available
  useEffect(() => {
    if (isLoading) return;
    if (!councilsData) return; // Add guard for councilsData
    if (!organizationManagers?.length) return; // Add guard for organizationManagers

    // Only set if no selection has been made yet
    const currentExistingId = form.getValues('eligibilityRequirements.agreement.existingId');
    if (currentExistingId) return;

    // If there are existing agreements, select the first one
    if (existingAgreements?.length > 0 && existingAgreements[0]?.address) {
      form.setValue('eligibilityRequirements.agreement.existingId', existingAgreements[0].address);
      // Trigger the onSelect handler to set up related fields
      agreementOptions[0].onSelect();
    } else {
      // set to new if it's the only option
      form.setValue('eligibilityRequirements.agreement.existingId', 'new');
      form.setValue('eligibilityRequirements.agreement.existingAdmins', 'org-managers');
      // Only set agreementAdmins if we have organizationManagers
      if (organizationManagers?.length > 0) {
        form.setValue('agreementAdmins', organizationManagers);
      }
    }
  }, [isLoading, existingAgreements, form, organizationManagers, agreementOptions, councilsData]);

  logger.info('form.watch (eligibilityRequirements.agreement):', form.watch('eligibilityRequirements.agreement'));
  logger.info('form.watch (agreementAdmins):', form.watch('agreementAdmins'));

  const submitForm = useCallback(
    async (data: Partial<CouncilFormData>) => {
      // Get current council form values
      // const currentValues = councilFormGetValues();
      const currentValues = form.getValues();

      // Merge the local form's eligibility requirements with existing council form data
      // preserving existing fields like 'required'
      const mergedValues = {
        ...currentValues,
        eligibilityRequirements: {
          ...currentValues.eligibilityRequirements,
          agreement: {
            ...currentValues.eligibilityRequirements?.agreement,
            ...data.eligibilityRequirements?.agreement,
          },
        },
      };

      // Reset council form with merged values
      // councilFormReset(mergedValues);
      form.reset(mergedValues);
      onNext();
    },
    [form, onNext],
  );

  if (isLoading) {
    return <LoadingAgreementStep />;
  }

  logger.info('agreementManagerOptions', agreementManagerOptions);

  const getIsDisabled = (): boolean => {
    const currentExistingId = form.watch('eligibilityRequirements.agreement.existingId');
    return Boolean(!canEdit || (currentExistingId && currentExistingId !== 'new'));
  };
  return (
    <>
      <Form {...form}>
        <form className='mx-auto flex w-full flex-col space-y-6' onSubmit={form.handleSubmit(submitForm)}>
          <div className='space-y-4'>
            <div className='flex items-center gap-4'>
              <FileText />
              <h2 className='text-2xl font-bold'>Sign Agreement</h2>
            </div>
          </div>
          {existingAgreements.length !== 0 && (
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
                  isDisabled={!canEdit || isLoadingList}
                />
              )}
            </div>
          )}

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
              placeholder='Write or paste your agreement text below in a markdown format, use the preview buttons in the toolbar.'
              // isDisabled={existingId !== 'new' && existingId !== null}
              isDisabled={getIsDisabled()}
            />
          </div>

          <div className='space-y-8'>
            <div className='space-y-2'>
              <h2 className='font-bold'>Who manages the agreement?</h2>

              {(existingId === 'new' || existingId === null) && (
                <>
                  {isLoading ? (
                    <div className='flex flex-col gap-4'>
                      <RadioCardSkeleton />
                      <RadioCardSkeleton />
                    </div>
                  ) : (
                    <RadioCard
                      name='eligibilityRequirements.agreement.existingAdmins'
                      localForm={form}
                      options={agreementManagerOptions as RadioCardOption[]}
                      // isDisabled={!canEdit || existingId !== 'new'}
                      isDisabled={getIsDisabled()}
                    />
                  )}
                </>
              )}
            </div>

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
                    agreementAdmins={agreementAdmins}
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

                  {!showAddForm && existingAdmins === 'new' && (
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
