'use client';

import { hatIdDecimalToHex, hatIdToTreeId, treeIdToTopHatId } from '@hatsprotocol/sdk-v1-core';
import { usePrivy } from '@privy-io/react-auth';
import { useCouncilForm, useOverlay } from 'contexts';
import { useHatDetails } from 'hats-hooks';
import { useClipboard, useCouncilDeployFlag, useCouncilDetails, useOrganization } from 'hooks';
import { Currency, DocumentChecks } from 'icons';
import { concat, find, get, map, some, toNumber, uniqBy } from 'lodash';
import { FileText, GemIcon, Link } from 'lucide-react';
import { useRouter } from 'next/navigation';
import posthog from 'posthog-js';
import { useMemo } from 'react';
import { BsPersonCheck } from 'react-icons/bs';
import { SupportedChains } from 'types';
import { Button, MemberAvatar, Tooltip } from 'ui';
import { chainsMap, formatAddress } from 'utils';
import { erc20Abi } from 'viem';
import { useChainId, useReadContracts, useSwitchChain } from 'wagmi';

import { Login } from '../../login';
import { NextStepButton } from '../../next-step-button';
import CalldataModal from './calldata-modal';
import { Deploy } from './deploy';
import { PaymentDetailsModal } from './payment-details-modal';
import { RequirementItem } from './requirement-item';
import { RoleSummary } from './role-summary';
import { StepSummary } from './step-summary';

// TODO handle loading state

export const DeployStep = ({ draftId }: { draftId: string }) => {
  const {
    form,
    stepValidation,
    deployCouncil,
    deployHats,
    deployModules,
    deployHsg,
    simulateCouncil,
    isDeploying,
    canEdit,
    deployStatus,
    simulateHats,
    isLoading,
  } = useCouncilForm();
  const formData = form.getValues();
  const router = useRouter();
  const { setModals } = useOverlay();
  const payer = form.watch('payer');
  const creator = form.watch('creator');
  const { user } = usePrivy();
  const userChainId = useChainId();
  const { switchChain } = useSwitchChain();

  useCouncilDeployFlag(draftId, true);

  const setCurrentStep = (step: string, subStep?: string) => {
    if (subStep) {
      router.push(`/councils/new/${step}?draftId=${draftId}&subStep=${subStep}`);
    } else {
      router.push(`/councils/new/${step}?draftId=${draftId}`);
    }
  };

  const draftUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/councils/new/deploy?draftId=${draftId}`;
  }, [draftId]);
  const { onCopy: copyUrl } = useClipboard(draftUrl, {
    toastData: { variant: 'success', title: 'Copied share link to clipboard' },
  });

  // Helper function to determine if eligibility step is valid
  const isEligibilityStepValid = () => {
    const activeSubSteps = [
      'members',
      'management',
      ...(formData.requirements?.signAgreement ? ['agreement'] : []),
      ...(formData.requirements?.holdTokens ? ['tokens'] : []),
      ...(formData.requirements?.passCompliance ? ['compliance'] : []),
    ];

    return activeSubSteps.every(
      (subStep) => stepValidation.eligibilitySubSteps[subStep as keyof typeof stepValidation.eligibilitySubSteps],
    );
  };

  const handleDeploy = async () => {
    posthog.capture('Initiated Council Deployment', {
      councilName: formData.councilName,
      organizationName: (formData.organizationName as unknown as { value: string }).value,
      chain: chainsMap(toNumber(formData.chain?.value))?.name,
    });

    // TODO better check for if first council deploy
    if (simulateCouncil) {
      deployCouncil();
    } else {
      deployHats();
    }
  };

  const tokenFields = ['symbol', 'name', 'decimals'];
  const shouldFetchToken = !!formData.tokenRequirement?.address?.value;
  const { data: tokenData } = useReadContracts({
    query: { enabled: shouldFetchToken },
    contracts: shouldFetchToken
      ? map(tokenFields, (field: string) => ({
          address: formData.tokenRequirement.address?.value,
          abi: erc20Abi,
          functionName: field,
          chainId: toNumber(formData.chain.value) || undefined,
        }))
      : [],
  });

  const organizationName = form.watch('organizationName') || '';
  const orgName = typeof organizationName === 'string' ? organizationName : organizationName.value;
  const { data: organization } = useOrganization(orgName);
  const [symbol, name] = map(tokenData, 'result');
  const targetChainId = toNumber(formData.chain?.value) as number;
  const targetChainName = chainsMap(targetChainId)?.name;
  const firstAdmin = get(formData, 'admins.[0]');
  const allWearers = uniqBy(
    concat(
      get(formData, 'members', []),
      get(formData, 'admins', []),
      get(formData, 'agreementAdmins', []),
      get(formData, 'complianceAdmins', []),
    ),
    'id',
  );

  const organizationManagers = organization?.councils?.[0]?.creationForm?.admins;
  const organizationOwner = organization?.councils?.[0]?.creationForm?.creator; // initial owner when/before deployed (not updated later)

  const { data: deployedCouncil } = useCouncilDetails({
    chainId: toNumber(formData.chain?.value),
    address: organization?.councils[0]?.hsg,
  });
  const signerHatId = deployedCouncil?.signerHats?.[0]?.id;
  const deployedCouncilTopHat = signerHatId ? treeIdToTopHatId(hatIdToTreeId(BigInt(signerHatId))) : undefined;
  const { data: topHat } = useHatDetails({
    hatId: deployedCouncilTopHat ? hatIdDecimalToHex(deployedCouncilTopHat) : undefined,
    chainId: toNumber(formData.chain?.value) as SupportedChains,
  });
  const topHatWearer = topHat?.wearers?.[0]?.id;
  const nameFromWearers = find(allWearers, (wearer) => wearer.id === (topHatWearer || organizationOwner))?.name;

  const isWrongNetwork = userChainId !== targetChainId;

  const copyCalldata = () => {
    setModals?.({ calldata: true });
  };
  // console.log('simulateHats', simulateHats);

  if (some(deployStatus, (value) => value)) {
    // TODO better check for `firstCouncil`
    return (
      <Deploy
        deployStatus={deployStatus}
        firstCouncil={!!simulateCouncil}
        draftId={draftId}
        deployModules={deployModules}
        deployHsg={deployHsg}
      />
    );
  }

  return (
    <div className='mx-auto max-w-4xl'>
      <div className='relative border-b border-gray-200 pb-6'>
        <div className='mb-4 flex items-start justify-between'>
          <div className='flex-1'>
            <div className='flex flex-col items-center gap-1'>
              <h2 className='line-clamp-2 max-w-[80%] text-center text-3xl font-medium'>{formData.councilName}</h2>
              <div className='flex gap-1'>
                <span className='text-gray-900'>by</span>{' '}
                <span className='text-gray-500'>
                  {firstAdmin?.name || <MemberAvatar member={firstAdmin || { address: '' }} />} (
                  {formatAddress(firstAdmin?.address)})
                </span>
              </div>
            </div>
          </div>
          <Button type='button' variant='outline-blue' rounded='full' onClick={copyUrl}>
            <Link className='h-4 w-4' /> Share Council Draft
          </Button>
        </div>
      </div>

      <StepSummary
        title='Council Details'
        isCompleted={stepValidation.details}
        onEdit={canEdit ? () => setCurrentStep('details') : undefined}
      >
        <div className='space-y-2'>
          <h4 className='text-base font-bold text-gray-900'>Deploy a Council to {targetChainName}</h4>
          <div className='text-gray-900'>
            <span className='text-base'>{formData.councilName}</span>
          </div>
          <div className='flex flex-col gap-1'>
            <h4 className='text-base font-bold text-gray-900'>Owned by {organization?.name || orgName}</h4>
            <MemberAvatar member={{ address: topHatWearer || organizationOwner || creator, name: nameFromWearers }} />
          </div>
        </div>
      </StepSummary>

      <StepSummary
        title='Signer Threshold'
        isCompleted={stepValidation.threshold}
        onEdit={canEdit ? () => setCurrentStep('threshold') : undefined}
      >
        <div className='space-y-2'>
          <h4 className='font-bold text-gray-900'>
            {formData.thresholdType === 'ABSOLUTE'
              ? `Deploy a new ${formData.min}/${formData.maxMembers} Safe Multisig`
              : `Deploy a new ${formData.target}% Safe Multisig`}
          </h4>
          <div className='text-gray-900'>
            <p className='text-base'>
              {formData.thresholdType === 'ABSOLUTE'
                ? `${formData.min} ${formData.min > 1 ? 'confirmations' : 'confirmation'} required`
                : `${formData.target}% (at least ${formData.min}) ${formData.min > 1 ? 'confirmations' : 'confirmation'} required`}
            </p>
            <p className='text-base'>{`From up to ${formData.maxMembers} Council Members`}</p>
          </div>
        </div>
      </StepSummary>

      <StepSummary
        title='Membership Requirements'
        isCompleted={stepValidation.selection}
        onEdit={canEdit ? () => setCurrentStep('selection') : undefined}
      >
        <div className='space-y-2'>
          <h4 className='text-base font-bold text-gray-900'>
            {`${Object.values(formData.requirements).filter(Boolean).length + 1} requirements for Council Members`}
          </h4>
          <div className='space-y-4'>
            <RequirementItem
              icon={<DocumentChecks className='h-6 w-6' />}
              title='Get Appointed'
              description='Must be appointed to the council'
            />
            {formData.requirements.passCompliance && (
              <RequirementItem
                icon={<BsPersonCheck className='h-6 w-6' />}
                title='Pass Compliance Checks'
                description='Must pass the compliance check'
              />
            )}
            {formData.requirements.signAgreement && (
              <RequirementItem
                icon={<FileText className='h-6 w-6' />}
                title='Sign Agreement'
                description='Must sign and abide by the agreement'
              />
            )}
            {formData.requirements.holdTokens && (
              <RequirementItem
                icon={<GemIcon className='h-6 w-6' />}
                title='Hold Tokens'
                description={`Must hold at least ${formData.tokenRequirement.minimum} ${symbol} (${name})`}
              />
            )}
          </div>
        </div>
      </StepSummary>

      <StepSummary
        title='Council Roles'
        isCompleted={isEligibilityStepValid()}
        onEdit={canEdit ? () => setCurrentStep('eligibility', 'management') : undefined}
      >
        <div className='space-y-8'>
          <RoleSummary
            title='Organization Managers appoint Council Members'
            members={(organizationManagers || formData.admins || []).map((member) => ({
              id: member.id,
              address: member.address,
              name: member.name,
            }))}
          />
          {formData.requirements.signAgreement && (
            <RoleSummary
              // TODO this breaks down in some existing cases
              title={`${formData.createAgreementAdminRole === 'true' ? 'Agreement' : 'Organization'} Managers own the agreement`}
              members={(formData.agreementAdmins || []) ?? (formData.admins || [])}
            />
          )}
          {formData.requirements.passCompliance && (
            <RoleSummary
              title='Compliance Managers check on Council Members'
              members={(formData.complianceAdmins || []) ?? (formData.admins || [])}
            />
          )}
          <RoleSummary title='Appointed Council Members can sign on the Safe' members={formData.members || []} />
          {/* <RoleSummary
            title='Council Managers'
            description='Can select Council Members and manage Council settings'
            members={formData.admins || []}
          /> */}
        </div>
      </StepSummary>

      <div>
        <StepSummary title='Invoice Details' isCompleted={!!payer}>
          <div className='space-y-4'>
            <RoleSummary
              title='Provide payment details'
              description='Set up a subscription to deploy and manage your council'
              members={
                payer
                  ? [
                      {
                        id: payer.address,
                        address: payer.address,
                        name: payer.name,
                      },
                    ]
                  : []
              }
            />
            <div className='flex justify-end'>
              {!!user &&
                (payer ? (
                  <Button
                    rounded='full'
                    type='button'
                    onClick={() => setModals?.({ paymentDetailsModal: true })}
                    disabled={!canEdit}
                  >
                    <div className='flex items-center gap-2'>
                      <Currency />
                      <span>Edit invoice details</span>
                    </div>
                  </Button>
                ) : (
                  <NextStepButton
                    type='button'
                    onClick={() => setModals?.({ paymentDetailsModal: true })}
                    disabled={!canEdit}
                  >
                    <div className='flex items-center gap-2'>
                      <Currency />
                      <span>Add invoice details</span>
                    </div>
                  </NextStepButton>
                ))}
            </div>
          </div>
        </StepSummary>
      </div>

      <div className='mt-8 flex flex-col items-center gap-4'>
        {user ? (
          <>
            <div className='flex items-center gap-2'>
              <input
                type='checkbox'
                id='agreement'
                checked={form.watch('acceptedTerms')}
                onChange={(e) => form.setValue('acceptedTerms', e.target.checked)}
                disabled={!canEdit}
                className={`accent-functional-link-primary h-4 w-4 rounded border-gray-300 ${!canEdit ? 'cursor-not-allowed opacity-50' : ''}`}
              />
              <label htmlFor='agreement' className='text-sm text-gray-600'>
                I agree to the{' '}
                <a
                  href='https://docs.hatsprotocol.xyz/legal/terms/privacy-policy'
                  className='text-functional-link-primary'
                  target='_blank'
                  rel='noreferrer'
                >
                  privacy policy
                </a>{' '}
                and a monthly fee of 299 USDC to be paid via invoice
              </label>
            </div>

            <div className='flex items-center gap-2'>
              <Button rounded='full' variant='outline-blue' size='lm' onClick={copyCalldata}>
                Copy Calldata
              </Button>
              {isWrongNetwork ? (
                <NextStepButton
                  onClick={() => switchChain?.({ chainId: targetChainId })}
                  disabled={!payer || !form.watch('acceptedTerms') || !canEdit}
                >
                  Switch to {targetChainName}
                </NextStepButton>
              ) : (
                <Tooltip
                  label={
                    // TODO better check for this
                    !formData.payer
                      ? 'Please update the invoice details'
                      : !simulateHats?.data?.result
                        ? "You don't have the needed permission to deploy to this organization"
                        : ''
                  }
                >
                  <NextStepButton
                    // TODO disable if not ready to deploy hats tx or council simulation fails
                    disabled={!payer || !form.watch('acceptedTerms') || isDeploying || !canEdit}
                    onClick={handleDeploy}
                  >
                    {isDeploying ? 'Deploying…' : `Deploy Council on ${targetChainName}`}
                  </NextStepButton>
                </Tooltip>
              )}

              <CalldataModal topHatWearer={topHatWearer} />
              <PaymentDetailsModal form={form} draftId={draftId} canEdit={canEdit} />
            </div>
          </>
        ) : (
          <Login />
        )}
      </div>
    </div>
  );
};
