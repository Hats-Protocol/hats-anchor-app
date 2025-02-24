import { HSG_V2_ABI } from '@hatsprotocol/constants';
import { useQueryClient } from '@tanstack/react-query';
import { useEligibility, useOverlay } from 'contexts';
import { useCouncilDetails, useSafeDetails, useWaitForSubgraph } from 'hooks';
import { filter, find, first, flatten, get, includes, keys, mapValues, size, toLower } from 'lodash';
import { useClaimFn } from 'modules-hooks';
import posthog from 'posthog-js';
import { useEffect, useState } from 'react';
import { BsArrowRight, BsCheck, BsCheckSquare, BsCheckSquareFill, BsFillXOctagonFill } from 'react-icons/bs';
import { AppHat, LabeledModules, ModuleDetails, SupportedChains } from 'types';
import { Button, LinkButton, Tooltip } from 'ui';
import { chainsMap, logger, sendTelegramMessage, tgChainSlug, tgFormatAddress } from 'utils';
import { Hex } from 'viem';
import { useAccount, useChainId, useSwitchChain, useWriteContract } from 'wagmi';

import { ModuleChainClaimButtons } from './module-chain-claim-buttons';

// const IS_CLAIMS_APP = process.env.NEXT_PUBLIC_IS_CLAIMS_APP === 'true';

const ModuleChainClaimHeader = ({
  hsgAddress,
  chainId,
  labeledModules,
  showJoinButton = false,
}: ModuleChainClaimHeaderProps) => {
  const { address } = useAccount();

  const [isClaimLoading, setIsClaimLoading] = useState(false);
  const [isVerifyLoading, setIsVerifyLoading] = useState(false);
  const currentChainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { handlePendingTx } = useOverlay();
  const queryClient = useQueryClient();

  const { data: councilDetails } = useCouncilDetails({
    chainId: chainId as SupportedChains,
    address: hsgAddress,
  });
  const { data: safeDetails } = useSafeDetails({
    safeAddress: councilDetails?.safe,
    chainId: chainId as SupportedChains,
  });
  const waitForSubgraph = useWaitForSubgraph({ chainId: chainId as SupportedChains });
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
  const isSigner = includes(safeDetails, address as Hex);

  // in cases where there's one module to complete the action and claim the hat, it likely has a readyToClaim status
  const completeToClaim = find(keys(aggregateIsReadyToClaim), (v: string) => get(aggregateIsReadyToClaim, v)); // TODO check that this is the only one/not already eligible
  const ruleToCompleteAndClaim = find(eligibilityRules, (rule) => get(rule, 'address') === completeToClaim);

  useEffect(() => {
    if (activeRule) return;

    setActiveRule(first(eligibilityRules));
    // intentionally excluding setActiveRule from the dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eligibilityRules, activeRule]);

  const {
    handleClaim: originalHandleClaim,
    disableClaim,
    disableReason,
  } = useClaimFn({
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readContract'] });
      setIsVerifyLoading(false);
      posthog.capture('Claimed Hat', {
        chainId,
        councilAddress: hsgAddress,
        hatId: selectedHat?.id,
        wearerAddress: address,
      });
    },
    onError: () => {
      setIsVerifyLoading(false);
    },
    onDecline: () => {
      setIsVerifyLoading(false);
    },
  });

  const handleVerify = () => {
    setIsVerifyLoading(true);
    originalHandleClaim();
  };

  const currentEligibilityClaim = mapValues(currentEligibility, (v: { eligible: boolean; goodStanding: boolean }) => {
    return get(v, 'eligible') && get(v, 'goodStanding');
  });
  const combinedReadyToClaim = {
    ...currentEligibilityClaim,
    ...aggregateIsReadyToClaim,
  };

  const { writeContractAsync } = useWriteContract();

  if (!activeRule?.address || !chainId) return null;

  const handleClaimSigner = async () => {
    setIsClaimLoading(true);
    if (!hsgAddress) return;

    const hash = await writeContractAsync({
      address: hsgAddress,
      abi: HSG_V2_ABI,
      functionName: 'claimSignerFor',
      args: [selectedHat?.id ? BigInt(selectedHat?.id) : BigInt(0), address as Hex],
    }).catch((err) => {
      logger.error(err);
      setIsClaimLoading(false);
      return undefined;
    });

    if (!hash) return;

    handlePendingTx?.({
      txChainId: chainId,
      txDescription: 'Claimed Signer for Council',
      hash,
      waitForSubgraph,
      onSuccess: () => {
        if (address) {
          const appUrl = get(window, 'location.origin', 'https://hats-pro.vercel.app');
          sendTelegramMessage(
            `${tgFormatAddress(address)} has joined the council ${tgFormatAddress(hsgAddress)} [View Council](${appUrl}/councils/${tgChainSlug(chainId)}:${hsgAddress}/members)`,
          );
        }

        queryClient.invalidateQueries({ queryKey: ['readContract'] });
        queryClient.invalidateQueries({ queryKey: ['safeDetails'] });
        queryClient.invalidateQueries({ queryKey: ['councilDetails'] });
        queryClient.invalidateQueries({ queryKey: ['currentEligibility'] });

        setIsClaimLoading(false);
        posthog.capture('Claimed Signer', {
          chainId,
          councilAddress: hsgAddress,
          wearerAddress: address,
        });
      },
    });
  };

  const completedRules = size(filter(eligibilityRules, (rule) => get(combinedReadyToClaim, rule.address)));
  const isReadyToClaim = completedRules === size(eligibilityRules);

  // TODO handle not connected

  return (
    <>
      <div className='flex justify-between'>
        <h2 className='text-2xl font-bold'>
          Satisfy these {size(eligibilityRules)} requirements to{' '}
          {!showJoinButton ? 'claim this role' : 'become a council member'}
        </h2>

        <div className='flex items-center gap-2'>
          <p className='text-xl font-semibold'>
            {completedRules}/{size(eligibilityRules)}
          </p>
          {isSigner ? (
            <BsCheckSquareFill className='text-functional-success h-6 w-6' />
          ) : isWearing ? (
            <BsCheckSquare className='text-functional-success h-6 w-6' />
          ) : isReadyToClaim ? (
            <BsCheckSquare className='text-functional-success h-6 w-6' />
          ) : (
            <BsFillXOctagonFill className='text-destructive h-6 w-6' />
          )}
        </div>
      </div>

      <div className='flex items-center'>
        <ModuleChainClaimButtons labeledModules={labeledModules} showJoinButton={showJoinButton} />

        {showJoinButton && (
          <div className='flex gap-2'>
            {isSigner ? (
              <div className='block-size-auto h-auto w-auto justify-start whitespace-normal rounded-md border border-gray-300 bg-white p-4'>
                <LinkButton
                  href={`/councils/${toLower(chainsMap(chainId).name)}:${hsgAddress}/members`}
                  className='border-functional-success text-functional-success hover:text-functional-success/80 rounded-full'
                  variant='outline'
                >
                  <span className='flex items-center gap-1'>
                    View Council
                    <BsArrowRight className='ml-1 h-4 w-4' />
                  </span>
                </LinkButton>
              </div>
            ) : chainId !== currentChainId ? (
              <div className='block-size-auto h-auto w-auto justify-start whitespace-normal rounded-md border border-gray-300 bg-white p-4'>
                <Button variant='outline-blue' rounded='full' onClick={() => switchChain({ chainId })}>
                  Change Chain
                </Button>
              </div>
            ) : (
              <div className='flex items-center gap-2'>
                <Tooltip label={disableReason}>
                  <div className='block-size-auto h-auto w-auto justify-start whitespace-normal rounded-md border border-[#2D3748] bg-white p-4'>
                    {isWearing ? (
                      <div className='text-functional-success flex h-10 items-center justify-center gap-1 px-4'>
                        <BsCheckSquareFill className='h-5 w-5' />
                        <span>Verified</span>
                      </div>
                    ) : (
                      <Button
                        disabled={
                          !address ||
                          chainId !== currentChainId ||
                          !isReadyToClaim ||
                          isVerifyLoading ||
                          isClaimLoading ||
                          disableClaim
                        }
                        rounded='full'
                        onClick={handleVerify}
                      >
                        {isVerifyLoading ? 'Verifying...' : 'Verify'}
                      </Button>
                    )}
                  </div>
                </Tooltip>

                {/* <div className='flex items-center'>
                  <div className='h-[1px] w-4 bg-[#2D3748]' />
                </div> */}

                <div className='block-size-auto h-auto w-auto justify-start whitespace-normal rounded-md border border-[#2D3748] bg-white p-4'>
                  {isSigner ? (
                    <div className='text-functional-success flex h-10 items-center justify-center gap-1 px-4'>
                      <BsCheckSquareFill className='h-5 w-5' />
                      <span>Claimed</span>
                    </div>
                  ) : (
                    <Button
                      disabled={
                        !address || chainId !== currentChainId || isClaimLoading || isVerifyLoading || !isWearing
                      }
                      rounded='full'
                      onClick={handleClaimSigner}
                    >
                      {isClaimLoading ? 'Claiming...' : 'Claim'}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

interface ModuleChainClaimHeaderProps {
  hsgAddress: Hex | undefined;
  chainId: number | undefined;
  labeledModules: LabeledModules | undefined;
  showJoinButton?: boolean;
}

export { ModuleChainClaimHeader };
