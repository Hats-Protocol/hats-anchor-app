'use client';

import { ModuleParameter } from '@hatsprotocol/modules-sdk';
import { useQueryClient } from '@tanstack/react-query';
import { useEligibility, useOverlay } from 'contexts';
import { Form, NumberInput } from 'forms';
import { useTokenDetails } from 'hooks';
import { get, isUndefined, pick, toLower } from 'lodash';
import { useLockFromHat } from 'modules-hooks';
import { ConnectWallet, NetworkSwitcher, TransactionButton } from 'molecules';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { BsArrowUpRightCircle } from 'react-icons/bs';
import { ModuleDetails } from 'types';
import { Skeleton } from 'ui';
import { getDuration, tokenImageHandler } from 'utils';
import { erc20Abi, formatUnits, maxUint256 } from 'viem';
import { useAccount, useChainId, useWriteContract } from 'wagmi';

const MIN_ONE_TIME_DURATION = 9 * 365; // 9 years, duration is in days

export const AllowanceActions = ({
  moduleDetails,
  moduleParameters,
  activeSubscription,
}: {
  moduleDetails: ModuleDetails;
  moduleParameters: ModuleParameter[] | undefined;
  activeSubscription: boolean;
}) => {
  const { chainId, setIsReadyToClaim } = useEligibility();
  const currentChainId = useChainId();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const queryClient = useQueryClient();
  const { setModals } = useOverlay();
  const localForm = useForm({});
  const { watch, reset } = pick(localForm, ['watch', 'reset']);

  const amount = watch('amount');
  const {
    isLoading,
    keyPrice,
    keyBalance,
    price, // price is queryable per address
    symbol,
    decimals,
    currencyContract,
    duration,
    lockAddress,
    allowance,
  } = useLockFromHat({
    moduleParameters,
    chainId,
  });

  const durationText = getDuration(duration);
  const isOneTime = duration && duration >= MIN_ONE_TIME_DURATION;
  const amountToApprove = amount && keyPrice ? BigInt(amount) * keyPrice : undefined;
  const tokenAmountText = amountToApprove ? formatUnits(amountToApprove, Number(decimals)) : '';
  const allowanceInDuration = allowance && keyPrice ? Number(allowance / keyPrice) : undefined;
  const hasAllowance = allowance && allowance >= BigInt(0);

  const { data: tokenData } = useTokenDetails({
    symbol: toLower(symbol),
  });

  useEffect(() => {
    if (isLoading) return;

    reset({ amount: allowanceInDuration || 1 });
  }, [allowanceInDuration, isLoading, reset]);

  const approvalParams = useMemo(() => {
    return {
      address: currencyContract,
      chainId,
      abi: erc20Abi,
      functionName: 'approve',
      args: [lockAddress, amountToApprove],
    };
  }, [lockAddress, amountToApprove, currencyContract, chainId]);

  const unlimitedApprovalParams = useMemo(() => {
    return {
      address: currencyContract,
      chainId,
      abi: erc20Abi,
      functionName: 'approve',
      args: [lockAddress, maxUint256],
    };
  }, [lockAddress, currencyContract, chainId]);

  const zeroApprovalParams = useMemo(() => {
    return {
      address: currencyContract,
      chainId,
      abi: erc20Abi,
      functionName: 'approve',
      args: [lockAddress, 0],
    };
  }, [lockAddress, currencyContract, chainId]);

  if (!chainId) return null;

  const tokenImage = tokenImageHandler({
    symbol,
    primaryImage: get(tokenData, 'avatar'),
    chainId,
  });
  let heading = 'Authorize Unlock Protocol to withdraw from your wallet';
  if (isOneTime) {
    heading = 'Authorize the one-time fee from your wallet';
  } else if (activeSubscription) {
    heading = 'Your active subscription';
  }

  let buttonText = `Approve ${amount || 0} ${durationText.noun}${amount > 1 || amount === 0 ? 's' : ''} (${tokenAmountText} ${symbol})`;
  if (isOneTime) {
    buttonText = `Approve ${tokenAmountText} ${symbol}`;
  }

  if (isLoading) {
    return (
      <div className='space-y-2'>
        <Skeleton className='h-10 w-full rounded-md' />

        <Skeleton className='h-10 w-full rounded-md' />

        <Skeleton className='h-10 w-full rounded-md' />

        <Skeleton className='h-[75px] w-full rounded-md' />
      </div>
    );
  }

  return (
    <div className='space-y-4 md:space-y-2'>
      <h3 className='text-base font-medium md:text-lg'>{heading}</h3>

      <Form {...localForm}>
        <div className='space-y-4'>
          <div className='flex flex-col items-center justify-between gap-6 md:flex-row md:gap-4'>
            <div className='flex w-full justify-between gap-4 md:w-auto'>
              {!isOneTime && (
                <div className='w-1/2'>
                  <NumberInput
                    name='amount'
                    numOptions={{ min: allowanceInDuration }}
                    label='Authorized Duration'
                    isDisabled={isLoading || !address}
                    localForm={localForm}
                  />
                </div>
              )}

              <div className='min-w-auto md:min-w-110px flex flex-col items-center gap-2'>
                <h2 className='text-sm uppercase'>{isOneTime ? 'One-time fee' : `${durationText.adjective} fee`}</h2>

                <div className='flex items-center gap-1'>
                  <img src={tokenImage} alt={`${symbol} token`} className='h-5 w-5' />

                  <p className='font-jb-mono'>{price || '??'}</p>
                  <p className='font-jb-mono text-gray-500'>{symbol}</p>
                </div>
              </div>
            </div>

            <div className='flex items-center'>
              {address ? (
                currentChainId === chainId ? (
                  <TransactionButton
                    sendTx={async () => {
                      // @ts-expect-error argument of type
                      return writeContractAsync(approvalParams);
                    }}
                    afterSuccess={() => {
                      if (!moduleDetails?.instanceAddress) return;
                      // refetchAllowance()
                      setIsReadyToClaim(moduleDetails.instanceAddress);
                      setModals?.({});
                      queryClient.invalidateQueries({
                        queryKey: ['readContracts'],
                      });
                    }}
                    disabled={
                      (!isUndefined(allowance) && !isUndefined(amountToApprove) && allowance >= amountToApprove) ||
                      !address ||
                      (!!isOneTime && !!keyBalance && keyBalance >= BigInt(0))
                    }
                    txDescription='Approve allowance on Hat subscription'
                    chainId={chainId}
                  >
                    {buttonText}
                  </TransactionButton>
                ) : (
                  <NetworkSwitcher chainId={chainId} />
                )
              ) : (
                <ConnectWallet />
              )}
            </div>
          </div>

          {address && !isOneTime && (
            <div className='flex h-[75px] flex-col items-center justify-around gap-2 md:flex-row md:justify-between md:gap-6'>
              {hasAllowance && (
                <TransactionButton
                  sendTx={async () => {
                    // @ts-expect-error argument of type
                    return writeContractAsync(zeroApprovalParams);
                  }}
                  afterSuccess={() => {
                    setTimeout(() => {
                      queryClient.invalidateQueries({
                        queryKey: ['readContracts'],
                      });
                      queryClient.invalidateQueries({ queryKey: ['readContract'] });
                    }, 1000);
                  }}
                  variant='link'
                  color='red.500'
                  txDescription='Cancel subscription for Hat'
                  chainId={chainId}
                >
                  <BsArrowUpRightCircle />
                  Cancel {activeSubscription ? 'Subscription' : 'Allowance'}
                </TransactionButton>
              )}

              <TransactionButton
                sendTx={async () => {
                  // @ts-expect-error argument of type
                  return writeContractAsync(unlimitedApprovalParams);
                }}
                afterSuccess={() => {
                  setTimeout(() => {
                    queryClient.invalidateQueries({ queryKey: ['readContracts'] });
                    queryClient.invalidateQueries({ queryKey: ['readContract'] });
                  }, 1000);
                }}
                variant='link'
                disabled={!isUndefined(allowance) && allowance === maxUint256}
                txDescription='Cancel subscription for Hat'
                chainId={chainId}
              >
                <BsArrowUpRightCircle />
                Authorize unlimited withdrawals
              </TransactionButton>
            </div>
          )}
        </div>
      </Form>
    </div>
  );
};
