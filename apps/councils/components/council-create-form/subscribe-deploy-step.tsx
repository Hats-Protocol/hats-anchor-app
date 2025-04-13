'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useCouncilForm, useOverlay } from 'contexts';
import { useClipboard, useCouncilDeployFlag } from 'hooks';
import { Currency, DocumentChecks } from 'icons';
import { get, isEmpty, map, some, toNumber } from 'lodash';
import { FileText, GemIcon, Link, SquarePen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import posthog from 'posthog-js';
import { useMemo } from 'react';
import { BsCheckSquareFill, BsPersonCheck, BsXSquareFill } from 'react-icons/bs';
import { Button, MemberAvatar } from 'ui';
import { chainsMap, formatAddress, logger } from 'utils';
import { erc20Abi } from 'viem';
import { useChainId, useReadContracts, useSwitchChain } from 'wagmi';

import { Login } from '../login';
import { NextStepButton } from '../next-step-button';
import { Deploy } from './deploy';
import { PaymentDetailsModal } from './payment-details-modal';

interface StepSummaryProps {
  title: string;
  isCompleted: boolean;
  onEdit?: () => void;
  children: React.ReactNode;
}

const StepSummary = ({ title, isCompleted, onEdit, children }: StepSummaryProps) => (
  <div className='flex items-start gap-6 border-b border-gray-200 pb-5 pt-3'>
    <div className='w-[200px] shrink-0 space-y-2'>
      <h3 className='text-l font-medium text-gray-900'>{title}</h3>
      <div className='flex items-center gap-1'>
        {isCompleted ? (
          <>
            <BsCheckSquareFill className='text-functional-success h-4 w-4' />
            <span className='text-functional-success text-sm font-medium'>Ready</span>
          </>
        ) : (
          <>
            <BsXSquareFill className='text-functional-error h-4 w-4' />
            <span className='text-functional-error text-sm font-medium'>Incomplete</span>
          </>
        )}
      </div>
    </div>

    <div className='min-w-0 flex-1'>{children}</div>

    {onEdit && (
      <div className='w-[100px] shrink-0 text-right'>
        <button
          type='button'
          className='text-functional-link-primary hover:text-functional-link-primary/60 inline-flex items-center gap-2'
          onClick={onEdit}
        >
          <SquarePen className='h-4 w-4' />
          <span className='text-sm font-medium'>Edit</span>
        </button>
      </div>
    )}
  </div>
);

interface RequirementItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const RequirementItem = ({ icon, title, description }: RequirementItemProps) => (
  <div className='flex items-center gap-3'>
    <div className='flex-shrink-0 rounded-full border border-gray-200 p-2 text-gray-900'>{icon}</div>
    <div>
      <p className='font-medium text-gray-900'>{title}</p>
      <p className='text-sm text-gray-600'>{description}</p>
    </div>
  </div>
);

interface RoleSummaryProps {
  title: string;
  description?: string;
  members: { id: string; address: string; name?: string }[];
}

const RoleSummary = ({ title, description, members }: RoleSummaryProps) => (
  <div className='space-y-2'>
    <div>
      <h4 className='text-base font-bold text-gray-900'>{title}</h4>
      {description && <p className='text-sm text-gray-600'>{description}</p>}
    </div>

    {!isEmpty(members) ? (
      <div className='space-y-2'>
        {members.map((member) => (
          <MemberAvatar key={member.id} member={member} />
        ))}
      </div>
    ) : (
      <div className='text-sm text-gray-600'>No members</div>
    )}
  </div>
);

export const SubscribeDeployStep = ({ draftId }: { draftId: string }) => {
  const { form, stepValidation, deployCouncil, isDeploying, canEdit, deployStatus, isLoading } = useCouncilForm();
  const formData = form.getValues();
  const router = useRouter();
  const { setModals } = useOverlay();
  const payer = form.watch('payer');
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
    return `${window.location.origin}/councils/new/payment?draftId=${draftId}`;
  }, [draftId]);
  const { onCopy: copyUrl } = useClipboard(draftUrl, {
    toastData: { variant: 'success', title: 'Copied share link to clipboard' },
  });

  // Helper function to determine if selection step is valid
  const isSelectionStepValid = () => {
    const activeSubSteps = [
      'members',
      'management',
      ...(formData.requirements?.signAgreement ? ['agreement'] : []),
      ...(formData.requirements?.holdTokens ? ['tokens'] : []),
      ...(formData.requirements?.passCompliance ? ['compliance'] : []),
    ];

    return activeSubSteps.every(
      (subStep) => stepValidation.selectionSubSteps[subStep as keyof typeof stepValidation.selectionSubSteps],
    );
  };

  const handleDeploy = async () => {
    posthog.capture('Initiated Council Deployment', {
      councilName: formData.councilName,
      organizationName: (formData.organizationName as unknown as { value: string }).value,
      chain: chainsMap(toNumber(formData.chain?.value))?.name,
    });
    deployCouncil();
  };

  const tokenFields = ['symbol', 'name', 'decimals'];
  const { data: tokenData } = useReadContracts({
    contracts: map(tokenFields, (field: string) => ({
      address: formData.tokenRequirement.address?.value,
      abi: erc20Abi,
      functionName: field,
      chainId: toNumber(formData.chain.value),
    })),
  });
  const [symbol, name] = map(tokenData, 'result');
  const targetChainId = toNumber(formData.chain?.value) as number;
  const targetChainName = chainsMap(targetChainId)?.name;
  const firstAdmin = get(formData, 'admins.[0]');

  const isWrongNetwork = userChainId !== targetChainId;

  if (some(deployStatus, (value) => value)) {
    return <Deploy deployStatus={deployStatus} draftId={draftId} />;
  }

  return (
    <div className='mx-auto max-w-4xl'>
      <div className='relative border-b border-gray-200 pb-6'>
        <div className='absolute right-0 top-0'>
          <Button type='button' variant='outline-blue' rounded='full' onClick={copyUrl}>
            <Link className='h-4 w-4' /> Share Council Draft
          </Button>
        </div>
        <div className='flex flex-col items-center gap-1'>
          <h2 className='text-3xl font-medium'>{formData.councilName}</h2>
          <div className='flex gap-1'>
            <span className='text-gray-900'>by</span>{' '}
            <span className='text-gray-500'>
              {firstAdmin?.name || <MemberAvatar member={firstAdmin || { address: '' }} />} (
              {formatAddress(firstAdmin?.address)})
            </span>
          </div>
        </div>
      </div>

      <StepSummary
        title='Council Details'
        isCompleted={stepValidation.details}
        onEdit={canEdit ? () => setCurrentStep('details') : undefined}
      >
        <div className='space-y-2'>
          <h4 className='text-base font-bold text-gray-900'>Create a Council</h4>
          <div className='text-gray-900'>
            <p className='text-base'>{formData.councilName}</p>
            <p className='text-base'>by {(formData.organizationName as unknown as { value: string }).value}</p>
            <p className='text-base'>on {targetChainName}</p>
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
        title='Council Settings'
        isCompleted={stepValidation.onboarding}
        onEdit={canEdit ? () => setCurrentStep('onboarding') : undefined}
      >
        <div className='space-y-2'>
          <h4 className='text-base font-bold text-gray-900'>
            {`${Object.values(formData.requirements).filter(Boolean).length + 1} requirements for Council Members`}
          </h4>
          <div className='space-y-4'>
            <RequirementItem
              icon={<DocumentChecks className='h-6 w-6' />}
              title='Get Appointed'
              description='Selected to be on the council'
            />
            {formData.requirements.passCompliance && (
              <RequirementItem
                icon={<BsPersonCheck className='h-6 w-6' />}
                title='Pass Compliance Checks'
                description='Passed the compliance check'
              />
            )}
            {formData.requirements.signAgreement && (
              <RequirementItem
                icon={<FileText className='h-6 w-6' />}
                title='Sign Agreement'
                description='Signed and abides by the agreement'
              />
            )}
            {formData.requirements.holdTokens && (
              <RequirementItem
                icon={<GemIcon className='h-6 w-6' />}
                title='Hold Tokens'
                description={`Hold at least ${formData.tokenRequirement.minimum} ${symbol} (${name})`}
              />
            )}
          </div>
        </div>
      </StepSummary>

      <StepSummary
        title='Council Roles'
        isCompleted={isSelectionStepValid()}
        onEdit={canEdit ? () => setCurrentStep('selection', 'management') : undefined}
      >
        <div className='space-y-8'>
          <RoleSummary title='Council Members' members={formData.members || []} />
          <RoleSummary
            title='Council Managers'
            description='Can select Council Members and manage Council settings'
            members={formData.admins || []}
          />
          {formData.requirements.passCompliance && (
            <RoleSummary
              title='Compliance Managers'
              description={
                formData.createComplianceAdminRole === 'true'
                  ? 'Conducts compliance checks on Council Members'
                  : 'Council Managers conduct compliance checks'
              }
              members={(formData.complianceAdmins || []) ?? (formData.admins || [])}
            />
          )}
          {formData.requirements.signAgreement && (
            <RoleSummary
              title='Agreement Managers'
              description={
                formData.createAgreementAdminRole === 'true'
                  ? 'Can update the agreement text and verify signatures'
                  : 'Council Managers manage the agreement'
              }
              members={(formData.agreementAdmins || []) ?? (formData.admins || [])}
            />
          )}
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
                and a monthly fee of 0.1 ETH to be paid via invoice
              </label>
            </div>

            {isWrongNetwork ? (
              <NextStepButton
                onClick={() => switchChain?.({ chainId: targetChainId })}
                disabled={!payer || !form.watch('acceptedTerms') || !canEdit}
              >
                Switch to {targetChainName}
              </NextStepButton>
            ) : (
              <NextStepButton
                disabled={!payer || !form.watch('acceptedTerms') || isDeploying || !canEdit}
                onClick={handleDeploy}
              >
                {isDeploying ? 'Deploying…' : `Deploy Council on ${targetChainName}`}
              </NextStepButton>
            )}

            <PaymentDetailsModal form={form} draftId={draftId} canEdit={canEdit} />
          </>
        ) : (
          <Login />
        )}
      </div>
    </div>
  );
};
