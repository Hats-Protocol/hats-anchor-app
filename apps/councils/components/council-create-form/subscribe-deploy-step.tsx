import { useToast } from '@chakra-ui/react';
import { useCouncilForm } from 'contexts';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { chainStringToId, formatAddress } from 'utils';
import { useChainId, useEnsName, useSwitchChain } from 'wagmi';

import { CheckSquareIcon } from '../icons/check-square-icon';
import { ComplianceCheckIcon } from '../icons/compliance-check-icon';
import { EditIcon } from '../icons/edit-icon';
import { GetAppointedIcon } from '../icons/get-appointed-icon';
import { HoldTokensIcon } from '../icons/hold-tokens-icon';
import { LinkIcon } from '../icons/link-icon';
import { PaymentIcon } from '../icons/payment-icon';
import { SignAgreementIcon } from '../icons/sign-agreement-icon';
import { XSquareIcon } from '../icons/x-square-icon';
import { NextStepButton } from '../next-step-button';
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
      <div className='flex items-center gap-2'>
        {isCompleted ? (
          <>
            <CheckSquareIcon />
            <span className='text-sm font-medium text-green-600'>Ready</span>
          </>
        ) : (
          <>
            <XSquareIcon />
            <span className='text-sm font-medium text-red-600'>Incomplete</span>
          </>
        )}
      </div>
    </div>

    <div className='min-w-0 flex-1'>{children}</div>

    {onEdit && (
      <div className='w-[100px] shrink-0 text-right'>
        <button
          type='button'
          className='inline-flex items-center gap-2 text-blue-600 hover:text-blue-700'
          onClick={onEdit}
        >
          <EditIcon />
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
    <div className='space-y-2'>
      {members.map((member) => (
        <MemberItem key={member.id} member={member} />
      ))}
    </div>
  </div>
);

const MemberItem = ({ member }: { member: { address: string; name?: string } }) => {
  const { data: ensName } = useEnsName({
    address: member.address as `0x${string}`,
    chainId: 1,
  });

  return (
    <div className='flex items-center gap-2'>
      {member.name && <span className='text-base font-medium text-gray-900'>{member.name}</span>}
      <span className='text-base text-gray-600'>{ensName || formatAddress(member.address)}</span>
    </div>
  );
};

export const SubscribeDeployStep = ({ draftId }: { draftId: string }) => {
  const { form, stepValidation, deployCouncil, isDeploying, canEdit } = useCouncilForm();
  const formData = form.getValues();
  const router = useRouter();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const payer = form.watch('payer');
  const toast = useToast();
  const userChainId = useChainId();
  const { switchChain } = useSwitchChain();

  const setCurrentStep = (step: string, subStep?: string) => {
    if (subStep) {
      router.push(`/councils/new/${step}?draftId=${draftId}&subStep=${subStep}`);
    } else {
      router.push(`/councils/new/${step}?draftId=${draftId}`);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/councils/new/payment?draftId=${draftId}`;
    navigator.clipboard.writeText(url).then(
      () => {
        // Could add a toast notification here
        console.log('URL copied to clipboard');
      },
      (err) => {
        console.error('Could not copy text: ', err);
      },
    );
  };

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
    try {
      const result = await deployCouncil();

      if (result.success) {
        // toast({
        //   title: 'Council deployed successfully',
        //   description: `Transaction hash: ${result.transactionHash}`,
        //   status: 'success',
        //   duration: 5000,
        //   isClosable: true,
        // });
        // Redirect to a success page or the new council page
        router.push('/councils');
      } else {
        console.log('result', result);
        // toast({
        //   title: 'Deployment failed',
        //   description: result.error || 'Unknown error occurred',
        //   status: 'error',
        //   duration: 5000,
        //   isClosable: true,
        // });
      }
    } catch (error) {
      console.error('Error deploying council', error);
      // toast({
      //   title: 'Deployment failed',
      //   description:
      //     error instanceof Error ? error.message : 'Unknown error occurred',
      //   status: 'error',
      //   duration: 5000,
      //   isClosable: true,
      // });
    }
  };

  const targetChainName = formData.chain.charAt(0).toUpperCase() + formData.chain.slice(1);
  const targetChainId = chainStringToId(formData.chain) as number;

  const isWrongNetwork = userChainId !== targetChainId;

  return (
    <div className='mx-auto max-w-4xl'>
      <div className='relative border-b border-gray-200 pb-6'>
        <div className='absolute right-0 top-0'>
          <button
            type='button'
            className='inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-gray-50'
            onClick={handleCopyLink}
          >
            <LinkIcon /> Copy link
          </button>
        </div>
        <div className='text-center'>
          <h2 className='text-3xl font-medium'>Proposed Council</h2>
          <p className='mt-1'>
            <span className='text-gray-900'>by</span> <span className='text-gray-500'>ccarella.eth</span>
          </p>
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
            <p className='text-base'>by {formData.organizationName}</p>
            <p className='text-base'>on {formData.chain}</p>
          </div>
        </div>
      </StepSummary>

      <StepSummary
        title='Signer Threshold'
        isCompleted={stepValidation.threshold}
        onEdit={canEdit ? () => setCurrentStep('threshold') : undefined}
      >
        <div className='space-y-2'>
          <h4 className='text-babse font-bold text-gray-900'>
            {formData.thresholdType === 'ABSOLUTE'
              ? `Deploy a new ${formData.confirmationsRequired}/${formData.maxMembers} Safe Multisig`
              : `Deploy a new ${formData.percentageRequired}% Safe Multisig`}
          </h4>
          <div className='text-gray-900'>
            <p className='text-base'>
              {formData.thresholdType === 'ABSOLUTE'
                ? `${formData.confirmationsRequired} confirmations required`
                : `${formData.percentageRequired}% confimations required`}
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
              icon={<GetAppointedIcon />}
              title='Get Appointed'
              description='Selected to be on the council'
            />
            {formData.requirements.passCompliance && (
              <RequirementItem
                icon={<ComplianceCheckIcon />}
                title='Pass Compliance Checks'
                description='Passed the compliance check'
              />
            )}
            {formData.requirements.signAgreement && (
              <RequirementItem
                icon={<SignAgreementIcon />}
                title='Sign Agreement'
                description='Signed and abides agreement'
              />
            )}
            {formData.requirements.holdTokens && (
              <RequirementItem
                icon={<HoldTokensIcon />}
                title='Hold Tokens'
                description='Signed and abides agreement'
              />
            )}
          </div>
        </div>
      </StepSummary>

      <StepSummary
        title='Council Roles'
        isCompleted={isSelectionStepValid()}
        onEdit={canEdit ? () => setCurrentStep('selection', 'members') : undefined}
      >
        <div className='space-y-8'>
          <RoleSummary title='Council Members' members={formData.members || []} />
          <RoleSummary
            title='Council Managers'
            description='Can select Council Members and manage the Safe'
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
              members={
                formData.createComplianceAdminRole === 'true' ? formData.complianceAdmins || [] : formData.admins || []
              }
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
              members={
                formData.createAgreementAdminRole === 'true' ? formData.agreementAdmins || [] : formData.admins || []
              }
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
              {payer ? (
                <button
                  type='button'
                  onClick={() => setIsPaymentModalOpen(true)}
                  disabled={!canEdit}
                  className={`inline-flex items-center rounded-full border border-[#2B6CB0] px-4 py-2 text-sm font-medium text-[#2B6CB0] ${
                    !canEdit ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className='flex items-center gap-2'>
                    <PaymentIcon />
                    <span>Edit invoice details</span>
                  </div>
                </button>
              ) : (
                <NextStepButton
                  type='button'
                  onClick={() => setIsPaymentModalOpen(true)}
                  disabled={!canEdit}
                  withIcon={false}
                >
                  <div className='flex items-center gap-2'>
                    <PaymentIcon />
                    <span>Add invoice details</span>
                  </div>
                </NextStepButton>
              )}
            </div>
          </div>
        </StepSummary>
      </div>

      <div className='mt-8 flex flex-col items-center gap-4'>
        <div className='flex items-center gap-2'>
          <input
            type='checkbox'
            id='agreement'
            checked={form.watch('acceptedTerms')}
            onChange={(e) => form.setValue('acceptedTerms', e.target.checked)}
            disabled={!canEdit}
            className={`h-4 w-4 rounded border-gray-300 accent-[#3182CE] ${!canEdit ? 'cursor-not-allowed opacity-50' : ''}`}
          />
          <label htmlFor='agreement' className='text-sm text-gray-600'>
            I agree to the{' '}
            <a href='#' className='text-blue-600'>
              privacy policy
            </a>{' '}
            and a monthly fee of $299 to be paid in USDC
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
            {isDeploying ? 'Deploying...' : `Deploy Council on ${targetChainName}`}
          </NextStepButton>
        )}
      </div>

      <PaymentDetailsModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        form={form}
        draftId={draftId}
        canEdit={canEdit}
      />
    </div>
  );
};
