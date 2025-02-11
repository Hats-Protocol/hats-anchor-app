'use client';

import { HSG_V2_ABI } from '@hatsprotocol/constants';
import { Ruleset } from '@hatsprotocol/modules-sdk';
import { useQueryClient } from '@tanstack/react-query';
import { Modal, useOverlay } from 'contexts';
import { useSafeDetails, useToast, useWaitForSubgraph } from 'hooks';
import { every, flatten, get, has, includes, map } from 'lodash';
import { AgreementStatusManager, AllowlistStatusManager, Erc20StatusManager } from 'modules-ui';
import { useMemo } from 'react';
import { BsCheckSquareFill, BsExclamationSquare, BsXSquare, BsXSquareFill } from 'react-icons/bs';
import type {
  AppHat,
  CouncilMember,
  CurrentEligibility,
  ExtendedHSGV2,
  OffchainCouncilData,
  StatusManagerProps,
  SupportedChains,
} from 'types';
import { Button, MemberAvatar } from 'ui';
import { getKnownEligibilityModule } from 'utils';
import { Hex } from 'viem';
import { useWriteContract } from 'wagmi';

type UserStatusModalProps = {
  chainId: number;
  userLabel: string;
  user?: CouncilMember | null;
  selectedHat?: AppHat | null;
  eligibilityRules?: Ruleset[];
  currentEligibility?: CurrentEligibility;
  offchainCouncilData?: OffchainCouncilData;
  councilData?: ExtendedHSGV2;
  afterSuccess?: (user: CouncilMember | undefined) => Promise<void>;
};

const KnownModuleStatusManagers = {
  allowlist: AllowlistStatusManager,
  agreement: AgreementStatusManager,
  erc20: Erc20StatusManager,
  // erc721: Erc721StatusManager,
  // erc1155: Erc1155StatusManager,
};

const MemberStatusManager = ({
  rule,
  user,
  selectedHat,
  chainId,
  labeledModules,
  currentEligibility,
}: StatusManagerProps) => {
  const knownModule = getKnownEligibilityModule(rule.module.implementationAddress as Hex);
  if (!knownModule) return null;
  if (!has(KnownModuleStatusManagers, knownModule)) return null;

  const StatusManager = KnownModuleStatusManagers[knownModule] as React.ComponentType<StatusManagerProps>;
  return (
    <StatusManager
      rule={rule}
      user={user}
      selectedHat={selectedHat}
      chainId={chainId}
      labeledModules={labeledModules}
      currentEligibility={currentEligibility}
    />
  );
};

function MemberStatusModal({
  chainId = 11155111,
  userLabel,
  user,
  eligibilityRules,
  currentEligibility,
  offchainCouncilData,
  councilData,
  afterSuccess,
  selectedHat,
}: UserStatusModalProps) {
  const queryClient = useQueryClient();
  const { setModals, handlePendingTx } = useOverlay();
  const { toast } = useToast();
  const waitForSubgraph = useWaitForSubgraph({ chainId: chainId as SupportedChains });
  const { data: safeOwners } = useSafeDetails({
    safeAddress: councilData?.safe as Hex,
    chainId: chainId as SupportedChains,
  });
  const isEligible = every(
    map(flatten(eligibilityRules), (rule) => {
      const moduleEligibility = get(currentEligibility, rule.address, { eligible: false, goodStanding: false });
      return moduleEligibility.eligible && moduleEligibility.goodStanding;
    }),
  );
  const isSigner = includes(safeOwners, user?.address);
  const isEligibleSigner = isEligible && isSigner;

  const labeledModules = useMemo(() => {
    if (!offchainCouncilData) return undefined;
    return {
      selection: get(offchainCouncilData, 'membersSelectionModule', '0x') as Hex,
      criteria: get(offchainCouncilData, 'membersCriteriaModule', '0x') as Hex,
    };
  }, [offchainCouncilData]);

  const { writeContractAsync } = useWriteContract();

  const removeSigner = async () => {
    const result = await writeContractAsync({
      address: councilData?.id as Hex,
      abi: HSG_V2_ABI,
      functionName: 'removeSigner',
      args: [user?.address as Hex],
    });
    handlePendingTx?.({
      hash: result,
      txChainId: chainId,
      txDescription: `Removed ${userLabel} as signer from ${offchainCouncilData?.creationForm.councilName} council`,
      waitForSubgraph,
      onSuccess: () => {
        setModals?.({});
        toast({
          title: 'Signer removed',
          description: `Removed ${userLabel} as signer from ${offchainCouncilData?.creationForm.councilName} council`,
        });
        queryClient.invalidateQueries({ queryKey: ['safeDetails'] });
        queryClient.invalidateQueries({ queryKey: ['currentEligibility'] });
      },
    });
  };

  return (
    <Modal name={`member-status-${user?.address}`} title={`Edit ${userLabel || 'Council Member'} Status`} size='xl'>
      <div className='flex flex-col gap-6 pb-4'>
        <MemberAvatar member={user} stack />

        <div className='flex justify-between border-b border-gray-200 pb-1'>
          <p className='text-sm font-medium'>Membership Requirements</p>

          <p className='text-sm font-medium'>Take Action</p>
        </div>

        {map(flatten(eligibilityRules), (rule) => (
          <MemberStatusManager
            key={rule.address}
            rule={rule}
            user={user || undefined}
            selectedHat={selectedHat || undefined}
            chainId={chainId}
            labeledModules={labeledModules}
            currentEligibility={currentEligibility}
          />
        ))}

        <div className='flex items-center justify-between'>
          <div className='flex flex-col gap-1'>
            <h4 className='font-medium'>Council Member</h4>
            <p className='text-sm'>
              {isEligibleSigner
                ? 'This Member is on the Council and can initiate and confirm transactions'
                : 'This Member has not joined the Council yet'}
            </p>
            {isEligibleSigner ? (
              <div className='text-functional-success flex items-center gap-2'>
                <BsCheckSquareFill className='size-4' />
                <p>Yes</p>
              </div>
            ) : isSigner ? (
              <div className='text-destructive flex items-center gap-2'>
                <BsExclamationSquare className='size-4' />
                <p>No</p>
              </div>
            ) : (
              <div className='text-destructive flex items-center gap-2'>
                <BsXSquareFill className='size-4' />
                <p>No</p>
              </div>
            )}
          </div>

          {!isEligibleSigner && isSigner && (
            <Button variant='destructive' rounded='full' onClick={removeSigner}>
              <BsXSquare className='size-4' />
              Remove Signer
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

export { MemberStatusModal };
