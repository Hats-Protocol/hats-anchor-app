import { HSG_V2_ABI } from '@hatsprotocol/constants';
import { useEligibility, useOverlay } from 'contexts';
import { useOffchainCouncilDetails } from 'hooks';
import { filter, find, first, flatten, get, keys, mapValues, size } from 'lodash';
import { useClaimFn } from 'modules-hooks';
import { useEffect, useMemo } from 'react';
import { BsCheckSquareFill, BsFillXOctagonFill } from 'react-icons/bs';
import { AppHat, ModuleDetails, SupportedChains } from 'types';
import { Button } from 'ui';
import { Hex } from 'viem';
import { useAccount, useChainId, useSwitchChain, useWriteContract } from 'wagmi';

import { ModuleChainClaimButtons } from './module-chain-claim-buttons';

const ModuleChainClaimHeader = ({ hsgAddress, chainId }: ModuleChainClaimHeaderProps) => {
  const { address } = useAccount();
  const currentChainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { handlePendingTx } = useOverlay();
  const {
    selectedHat,
    eligibilityRules: rawEligibilityRules,
    currentEligibility,
    isReadyToClaim: aggregateIsReadyToClaim,
    activeRule,
    setActiveRule,
    isWearing,
  } = useEligibility();
  const eligibilityRules = flatten(rawEligibilityRules);
  const { data: offchainCouncilDetails } = useOffchainCouncilDetails({ chainId, hsg: hsgAddress });

  // in cases where there's one module to complete the action and claim the hat, it likely has a readyToClaim status
  const completeToClaim = find(keys(aggregateIsReadyToClaim), (v: string) => get(aggregateIsReadyToClaim, v)); // TODO check that this is the only one/not already eligible
  const ruleToCompleteAndClaim = find(eligibilityRules, (rule) => get(rule, 'address') === completeToClaim);

  useEffect(() => {
    if (activeRule) return;

    setActiveRule(first(eligibilityRules));
    // intentionally excluding setActiveRule from the dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eligibilityRules, activeRule]);

  // TODO check this value ASAP
  const labeledModules = useMemo(() => {
    if (!offchainCouncilDetails) return undefined;
    return {
      selection: get(offchainCouncilDetails, 'creationForm.selectionModule', '0x') as Hex,
      criteria: get(offchainCouncilDetails, 'creationForm.criteriaModule', '0x') as Hex,
    };
  }, [offchainCouncilDetails]);
  console.log('labeledModules', labeledModules);

  const { handleClaim } = useClaimFn({
    selectedHat: selectedHat as AppHat,
    handlePendingTx,
    moduleParameters: ruleToCompleteAndClaim?.liveParams,
    moduleDetails: {
      ...ruleToCompleteAndClaim?.module,
      id: ruleToCompleteAndClaim?.module.id as Hex,
      version: ruleToCompleteAndClaim?.module.version as string,
      instanceAddress: ruleToCompleteAndClaim?.address,
      liveParameters: ruleToCompleteAndClaim?.liveParams,
    } as ModuleDetails,
    chainId: chainId as SupportedChains,
    isReadyToClaim: aggregateIsReadyToClaim,
  });

  const currentEligibilityClaim = mapValues(currentEligibility, (v: { eligible: boolean; goodStanding: boolean }) => {
    return get(v, 'eligible') && get(v, 'goodStanding');
  });
  const combinedReadyToClaim = {
    ...currentEligibilityClaim,
    ...aggregateIsReadyToClaim,
  };

  const { writeContractAsync } = useWriteContract();

  if (!activeRule?.address || !chainId) return null;

  const handleClaimClick = async () => {
    if (isWearing) {
      if (!hsgAddress) return;
      const tx = await writeContractAsync({
        address: hsgAddress,
        abi: HSG_V2_ABI,
        functionName: 'claimSignerFor',
        args: [selectedHat?.id ? BigInt(selectedHat?.id) : BigInt(0), address as Hex],
      });
      // redirect to council page
      console.log('tx', tx);
      // TODO handlePendingTx
    } else {
      handleClaim();
    }

    // TODO success? is overlay context available?
  };

  const completedRules = size(filter(eligibilityRules, (rule) => get(combinedReadyToClaim, rule.address)));
  const isReadyToClaim = completedRules === size(eligibilityRules);

  // TODO handle not connected

  return (
    <>
      <div className='flex justify-between'>
        <h2 className='text-2xl font-bold'>Comply with {size(eligibilityRules)} rules to claim this role</h2>

        <div className='flex items-center gap-2'>
          <p className='text-xl font-semibold'>
            {completedRules}/{size(eligibilityRules)}
          </p>
          {isReadyToClaim ? (
            <BsCheckSquareFill className='h-6 w-6 text-green-500' />
          ) : (
            <BsFillXOctagonFill className='h-6 w-6 text-red-500' />
          )}
        </div>
      </div>

      <div className='flex items-center justify-between'>
        <ModuleChainClaimButtons labeledModules={labeledModules} />

        {chainId !== currentChainId ? (
          <Button variant='outline-blue' onClick={() => switchChain({ chainId })}>
            Change Chain
          </Button>
        ) : (
          <Button disabled={!address || chainId !== currentChainId || !isReadyToClaim} onClick={handleClaimClick}>
            Claim {isWearing ? 'Signer' : ''}
          </Button>
        )}
      </div>
    </>
  );
};

interface ModuleChainClaimHeaderProps {
  hsgAddress: Hex | undefined;
  chainId: number | undefined;
}

export default ModuleChainClaimHeader;
