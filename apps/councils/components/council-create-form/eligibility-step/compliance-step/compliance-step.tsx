'use client';

import { hatIdHexToDecimal, hatIdIpToDecimal } from '@hatsprotocol/sdk-v1-core';
import { hatIdDecimalToHex } from '@hatsprotocol/sdk-v1-core';
import { useCouncilForm } from 'contexts';
import { Form, RadioCard, RadioCardOption } from 'forms';
import { filter, find, flatten, get, map, pick, reject, toLower, uniq, uniqBy } from 'lodash';
import { FilePlus, FileText } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BsPersonCheck } from 'react-icons/bs';
import { FiUserPlus } from 'react-icons/fi';
import { IconType } from 'react-icons/lib';
import { CouncilData, CouncilFormData, CouncilMember, StepProps } from 'types';
import { Button } from 'ui';
import { getKnownEligibilityModule, logger } from 'utils';
import { Hex } from 'viem';

import { NextStepButton } from '../../../next-step-button';
import { findNextInvalidStep, getNextStepButtonText } from '../../utils';
import { ComplianceList } from '../compliance-list';
import { UnifiedUserForm } from '../unified-user-form';
import { LoadingComplianceStep, RadioCardSkeleton } from './compliance-skeletons';

const getAdminHatId = (treeId: number | undefined): Hex | null => {
  if (!treeId) return null;
  const newHatId = `${treeId}.1`;
  return hatIdDecimalToHex(hatIdIpToDecimal(newHatId));
};

export function ComplianceStep({ onNext }: StepProps) {
  const { form, isLoading, stepValidation, canEdit, councilsData } = useCouncilForm();

  const [editingAdmin, setEditingAdmin] = useState<CouncilMember | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isMutating, setIsMutating] = useState(false);

  const eligibilityRequirements = form.watch('eligibilityRequirements');
  const { existingId, existingAdmins } = pick(eligibilityRequirements.compliance, ['existingId', 'existingAdmins']);
  logger.info('existingId', existingAdmins);

  logger.info('eligibilityRequirments compliance', eligibilityRequirements);
  const complianceAdmins = form.watch('complianceAdmins') || [];
  logger.info('complianceAdmins', complianceAdmins);

  // // Add useEffect to set initial values when component mounts // TODO: Come back to this, causing error in the context
  // useEffect(() => {
  //   if (isLoading) return;

  //   const { compliance } = eligibilityRequirements;
  //   const initialValues: Omit<Partial<CouncilFormData>, 'existingId'> = {
  //     eligibilityRequirements: {
  //       compliance: {
  //         // @ts-expect-error move to subforms to avoid challenges with the types between the parent and active forms
  //         existingId: compliance.existingId || 'new',
  //         existingAdmins: compliance.existingAdmins || null,
  //       },
  //     },
  //     complianceAdmins: compliance.existingAdmins ? [] : complianceAdmins,
  //   };

  //   form.reset(initialValues);
  // }, [isLoading, eligibilityRequirements]);

  const nextStep = findNextInvalidStep(stepValidation, 'eligibility', 'compliance', eligibilityRequirements);

  const existingComplianceModules = useMemo(() => {
    const rawCouncilsWithComplianceModules = councilsData?.map((council) => {
      return flatten(council.eligibilityRules).find(
        (rule) => getKnownEligibilityModule(rule.module.implementationAddress as Hex) === 'allowlist',
      );
    });
    logger.info('rawCouncilsWithComplianceModules', rawCouncilsWithComplianceModules);

    // getting the unique councils with compliance modules
    const councilsWithComplianceModules = uniqBy(rawCouncilsWithComplianceModules, 'address');

    // we want to get the councils that are associated with each compliance module
    const complianceModulesWithCouncilData = councilsWithComplianceModules.map((complianceModule) => {
      return {
        ...complianceModule,
        councils: councilsData?.filter((council) =>
          map(flatten(council.eligibilityRules), 'address').includes(complianceModule?.address || '0x'),
        ) as CouncilData[],
      };
    });
    const filteredComplianceModules = reject(
      complianceModulesWithCouncilData,
      (module) => toLower(module.address) === toLower(module.councils[0]?.membersSelectionModule),
    );

    return filteredComplianceModules;
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

  const treeId = councilsData?.[0]?.treeId;
  const adminHatId = getAdminHatId(treeId);

  logger.info('existingComplianceModules', existingComplianceModules);
  // TODO: handle the setValue more robustly incase the agreementAdmins is not set on the first council (line 125)
  // Create radio options from existing agreements and add the "Create new" option
  const complianceModuleOptions = useMemo(
    () => [
      ...(existingComplianceModules || []).map((existingComplianceModule) => ({
        value: existingComplianceModule?.address,
        label: 'Compliance Allowlist',
        icon: FileText as IconType,
        description: existingComplianceModule?.councils.map((council) => council.creationForm.councilName).join(', '),
        onSelect: () => {
          const existingAdmins = find(get(existingComplianceModule, 'liveParams'), { label: 'Owner Hat' });
          const adminsHatId = existingAdmins?.value ? hatIdDecimalToHex(existingAdmins?.value as bigint) : null;
          form.setValue(
            'eligibilityRequirements.compliance.existingAdmins',
            adminsHatId === adminHatId ? 'org-managers' : adminsHatId,
          );
          form.setValue(
            'complianceAdmins',
            adminsHatId === adminHatId
              ? organizationManagers
              : existingComplianceModule?.councils?.[0]?.creationForm?.complianceAdmins || [],
          );
        },
      })),
      {
        value: 'new',
        label: 'Create a new Compliance Allowlist for this Council',
        icon: FilePlus as IconType,
        description: 'Create an allowlist and select who controls it',
        onSelect: () => {
          // TODO check if there's an agreement in local storage and use that https://linear.app/hats-protocol/issue/BUILD-344
          // form.setValue('eligibilityRequirements.agreement.existingId', 'new');
        },
      },
    ],
    [existingComplianceModules, adminHatId, form],
  );

  // Group unique admin sets across councils
  const complianceAdminGroups = useMemo(() => {
    const rawCouncilsWithAgreements = councilsData?.map((council) => {
      return flatten(council.eligibilityRules).find(
        (rule) => getKnownEligibilityModule(rule.module.implementationAddress as Hex) === 'allowlist',
      );
    });

    const councilsWithAgreements = uniqBy(rawCouncilsWithAgreements, 'address');

    const allowlistsWithCouncilData = councilsWithAgreements.map((allowlist) => {
      return {
        ...allowlist,
        councils: councilsData?.filter((council) =>
          map(flatten(council.eligibilityRules), 'address').includes(allowlist?.address || '0x'),
        ) as CouncilData[],
      };
    });

    logger.info('allowlistsWithCouncilData', allowlistsWithCouncilData);
    logger.info('councilsData', councilsData);

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

      const label = moduleEligibilityRules?.includes('allowlist') ? 'Compliance Manager' : 'Agreement Manager';

      const descriptionNames = councilsByHatId?.map((council) => council.creationForm.councilName).join(', ');
      const councilsCount = councilsByHatId?.length || 0;

      const description = moduleEligibilityRules?.includes('allowlist')
        ? `Manages Compliance for ${descriptionNames}`
        : `Manages ${councilsCount > 1 ? councilsCount + ' Agreements' : ' Agreement'} for ${descriptionNames}`;

      const avatars = moduleEligibilityRules?.includes('allowlist')
        ? flatten(councilsByHatId?.map((council) => council.creationForm.complianceAdmins))
        : flatten(councilsByHatId?.map((council) => council.creationForm.agreementAdmins));

      return {
        value: hatIdDecimalToHex(hatValue),
        label,
        description,
        avatars,
        onSelect: () => {
          // TODO: Ensure that these are being appropriately set
          // const existingAdmins = find(get(allowlistsWithCouncilData[0], 'liveParams'), { label: 'Owner Hat' }); -- this is not correct and resulting in the org-managers being set every time
          // logger.info('existingAdmins', existingAdmins);
          // const adminsHatId = existingAdmins?.value ? hatIdDecimalToHex(existingAdmins.value as bigint) : null;

          // form.setValue(
          //   'eligibilityRequirements.compliance.existingAdmins',
          //   adminsHatId === adminHatId ? 'org-managers' : adminsHatId,
          // );
          form.setValue('complianceAdmins', avatars);
        },
      };
    });

    return uniqBy(preExistingOptions, 'value');
  }, [councilsData]);

  const complianceManagerOptions = useMemo(
    () => [
      {
        value: 'org-managers',
        label: 'Organization Managers',
        description: 'Manage Roles on all Councils',
        avatars: organizationManagers,
        onSelect: () => form.setValue('complianceAdmins', organizationManagers),
      },
      ...complianceAdminGroups,
      {
        value: 'new',
        label: 'Create new Compliance Managers',
        description: 'Create a new group of agreement managers',
        onSelect: () => form.setValue('complianceAdmins', []),
      },
    ],
    [organizationManagers, form],
  );
  logger.info('complianceManagerOptions', complianceManagerOptions);
  // Show loading state during mutation or while fetching updated data
  const isLoadingList = isMutating || isLoading;

  const submitForm = useCallback(
    async (data: Partial<CouncilFormData>) => {
      // Get current council form values
      // const currentValues = councilFormGetValues();
      const currentValues = form.getValues();

      // Merge the local form's eligibility requirements with existing council form data
      // preserving existing fields like 'required'
      // const mergedValues = {
      //   ...currentValues,
      //   eligibilityRequirements: {
      //     ...currentValues.eligibilityRequirements,
      //     compliance: {
      //       ...currentValues.eligibilityRequirements?.compliance,
      //       ...data.eligibilityRequirements?.compliance,
      //     },
      //   },
      // };

      // Reset council form with merged values
      // councilFormReset(mergedValues);
      form.reset(currentValues);
      onNext();
    },
    [form, onNext],
  );

  // Set initial selection to first existing agreement if available
  useEffect(() => {
    if (isLoading) return;

    // Only set if no selection has been made yet
    const currentExistingId = form.getValues('eligibilityRequirements.compliance.existingId');
    if (currentExistingId) return;

    // If there are existing agreements, select the first one
    if (existingComplianceModules?.length > 0 && existingComplianceModules[0]?.address) {
      form.setValue('eligibilityRequirements.compliance.existingId', existingComplianceModules[0].address);
      // Trigger the onSelect handler to set up related fields
      complianceModuleOptions[0].onSelect();
    }
  }, [isLoading, existingComplianceModules, form, complianceModuleOptions]);

  if (isLoading) {
    return <LoadingComplianceStep />;
  }

  return (
    <>
      <Form {...form}>
        <form className='mx-auto flex w-full flex-col space-y-6' onSubmit={form.handleSubmit(submitForm)}>
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

          {existingComplianceModules.length !== 0 && (
            <div className='space-y-4'>
              <div className='flex flex-col gap-1'>
                <div className='flex items-center gap-2'>
                  <h3 className='font-bold'>Which compliance allowlist should Council Members sign?</h3>
                </div>
              </div>

              {isLoading ? (
                <div className='flex flex-col gap-4'>
                  <RadioCardSkeleton />
                  <RadioCardSkeleton />
                </div>
              ) : (
                <RadioCard
                  name='eligibilityRequirements.compliance.existingId' // TODO existingModule
                  localForm={form}
                  options={complianceModuleOptions as RadioCardOption[]}
                  isDisabled={!canEdit || isLoadingList}
                />
              )}
            </div>
          )}

          <div className='space-y-8'>
            <div className='space-y-2'>
              <h2 className='font-bold'>Who does the compliance check?</h2>
              {existingId === 'new' && (
                <>
                  {isLoading ? (
                    <div className='flex flex-col gap-4'>
                      <RadioCardSkeleton />
                      <RadioCardSkeleton />
                      <RadioCardSkeleton />
                    </div>
                  ) : (
                    <RadioCard
                      name='eligibilityRequirements.compliance.existingAdmins'
                      localForm={form}
                      options={complianceManagerOptions as RadioCardOption[]}
                      isDisabled={!canEdit || isLoadingList}
                    />
                  )}
                </>
              )}
            </div>

            {!isLoading && (
              <div>
                <h3 className='mb-2 font-medium'>Compliance Managers</h3>
                <p className='text-sm'>
                  Compliance Managers can verify the compliance of Council Members before they join the council and
                  remove members who are no longer compliant.
                </p>
                <div className='mt-4 space-y-4'>
                  <ComplianceList
                    complianceAdmins={complianceAdmins}
                    form={form}
                    canEdit={eligibilityRequirements.compliance.existingId === null && canEdit}
                    canDelete={eligibilityRequirements.compliance.existingId === null ? canEdit : false}
                    showButtons={eligibilityRequirements.compliance.existingId === null}
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
                      Add Compliance Manager
                    </Button>
                  )}
                </div>
              </div>
            )}

            {existingAdmins === 'new' && showAddForm && (
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
                  onMutationStateChange={setIsMutating}
                />
              </div>
            )}
          </div>

          <div className='flex justify-end py-6'>
            <NextStepButton
              disabled={
                !form.formState.isValid ||
                (existingId === null && complianceAdmins.length === 0) ||
                !canEdit ||
                isLoadingList
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
