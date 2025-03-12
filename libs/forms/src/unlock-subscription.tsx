'use client';

import { CHAIN_TOKENS } from '@hatsprotocol/constants';
import { useQueryClient } from '@tanstack/react-query';
import { PublicLockV14 } from '@unlock-protocol/contracts';
import { find, isUndefined } from 'lodash';
import { useLock } from 'modules-hooks';
import { NetworkSwitcher, TransactionButton } from 'molecules';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { BsArrowUpRightCircle } from 'react-icons/bs';
import { SupportedChains } from 'types';
import { Card, Link } from 'ui';
import { explorerUrl, formatAddress, ipfsUrl, REFERRAL_ADDRESS } from 'utils';
import { Abi, erc20Abi, formatUnits, Hex, maxUint256 } from 'viem';
import { useAccount, useChainId, useWriteContract } from 'wagmi';

import { Form, NumberInput } from './components';

const HATS_PRO_LOCKS = {
  // TODO UPDATE VALUES
  1: '0x136b21a07d544971f20E3284586FD4acAa0a0345',
  10: '0x136b21a07d544971f20E3284586FD4acAa0a0345', // ONLY REAL ONE
  100: '0x136b21a07d544971f20E3284586FD4acAa0a0345',
  137: '0x136b21a07d544971f20E3284586FD4acAa0a0345',
  8453: '0x136b21a07d544971f20E3284586FD4acAa0a0345',
  42161: '0x136b21a07d544971f20E3284586FD4acAa0a0345',
  42220: '0x136b21a07d544971f20E3284586FD4acAa0a0345',
  11155111: '0xBb7E98420b824602ceEebD8e8220351aE42667b0',
};

const UnlockSubscriptionDev = ({ chainId = 11155111 }: { chainId?: number }) => {
  const localForm = useForm();
  const { reset } = localForm;
  const { address } = useAccount();
  const currentChainId = useChainId();
  const { writeContractAsync } = useWriteContract();
  const queryClient = useQueryClient();

  const { price, keyBalance, keyPrice, tokenBalance, allowance, symbol, keyExpirationTimestamp } = useLock({
    lockAddress: HATS_PRO_LOCKS[chainId as SupportedChains] as Hex,
    chainId,
  });

  // token info
  const token = find(CHAIN_TOKENS[chainId as SupportedChains], { symbol: 'USDC' });
  const tokenImage = ipfsUrl(token?.logoURI);

  const monthsAmount = localForm.watch('amount') || 1;
  const cost = price && BigInt(monthsAmount) * BigInt(price);
  const hasTokenAllowance = allowance && allowance >= (cost || BigInt(0));
  const hasTokenBalance = tokenBalance && tokenBalance >= (cost || BigInt(0));
  const activeSubscription = keyBalance && keyBalance > BigInt(0);

  const tokenContractParams = useMemo(() => {
    if (!token) return undefined;

    return { address: token?.address, abi: erc20Abi };
  }, [token]);

  const approvalParams = useMemo(() => {
    if (!tokenContractParams || !chainId) return undefined;

    return {
      ...tokenContractParams,
      functionName: 'approve' as const,
      args: [
        HATS_PRO_LOCKS[chainId as SupportedChains],
        (cost ? BigInt(cost) : BigInt(0)) * BigInt(10 ** (token?.decimals || 18)),
      ] as [Hex, bigint],
    };
  }, [tokenContractParams, chainId, cost, token]);

  const zeroApprovalParams = useMemo(() => {
    if (!tokenContractParams || !chainId) return undefined;

    return {
      ...tokenContractParams,
      functionName: 'approve' as const,
      args: [HATS_PRO_LOCKS[chainId as SupportedChains], BigInt(0)] as [Hex, bigint],
    };
  }, [tokenContractParams, chainId]);

  const unlimitedApprovalParams = useMemo(() => {
    if (!tokenContractParams || !chainId) return undefined;

    return {
      ...tokenContractParams,
      functionName: 'approve' as const,
      args: [HATS_PRO_LOCKS[chainId as SupportedChains], maxUint256] as [Hex, bigint],
    };
  }, [tokenContractParams, chainId]);

  const subscribeParams = useMemo(() => {
    if (!chainId) return undefined;
    const data = '0x';

    return {
      address: HATS_PRO_LOCKS[chainId as SupportedChains],
      abi: PublicLockV14.abi as Abi,
      functionName: 'purchase' as const,
      args: [[keyPrice], [address!], [REFERRAL_ADDRESS], [address!], [data]],
    };
  }, [chainId, address, keyPrice]);

  useEffect(() => {
    reset({ amount: 12 });
  }, [reset]);

  return (
    <div className='flex flex-col gap-6'>
      <Card className='mx-auto flex max-w-3xl flex-col gap-6 p-10'>
        <h1 className='text-center text-2xl font-bold'>Unlock Subscription Dev</h1>

        <Form {...localForm}>
          <div className='space-y-4'>
            <div className='flex flex-col items-center justify-between gap-6 md:flex-row md:gap-4'>
              <div className='flex w-full justify-between gap-4 md:w-auto'>
                <div className='w-1/2'>
                  <NumberInput
                    name='amount'
                    numOptions={{ min: 0 }}
                    label='Months to subscribe'
                    isDisabled={!address}
                    localForm={localForm}
                    variant='councils'
                  />
                </div>

                <div className='flex flex-col items-center gap-2 md:min-w-[110px]'>
                  <h2 className='text-sm uppercase'>Monthly fee</h2>

                  <div className='flex items-center gap-1'>
                    <img src={tokenImage} alt={`${symbol} token`} className='h-5 w-5' />

                    <p className='font-jb-mono'>{price || '??'}</p>
                    <p className='font-jb-mono text-gray-500'>{symbol}</p>
                  </div>
                </div>

                <div className='flex flex-col items-center gap-2 md:min-w-[120px]'>
                  <h2 className='text-sm uppercase'>Total</h2>

                  <div className='flex items-center gap-1'>
                    <p className='font-jb-mono'>{cost || '??'}</p>
                    <p className='font-jb-mono text-gray-500'>{symbol}</p>
                  </div>
                </div>
              </div>

              <div className='flex items-center'>
                {address ? (
                  currentChainId === chainId ? (
                    <TransactionButton
                      sendTx={async () => {
                        if (!approvalParams) throw new Error('Approval params not found');
                        return writeContractAsync(approvalParams);
                      }}
                      afterSuccess={() => {
                        queryClient.invalidateQueries({ queryKey: ['readContracts'] });
                      }}
                      disabled={!!cost && cost < allowance}
                      txDescription='Approve allowance on Hat subscription'
                      chainId={chainId}
                      variant='outline-blue'
                    >
                      Approve
                    </TransactionButton>
                  ) : (
                    <NetworkSwitcher chainId={chainId as SupportedChains} />
                  )
                ) : (
                  <p>Connect your Wallet</p>
                )}
              </div>
            </div>

            <div className='flex w-full justify-around'>
              <div className='flex w-1/3 flex-col items-center gap-2 md:min-w-[110px]'>
                <h2 className='text-sm uppercase'>Your Balance</h2>

                <div className='flex items-center gap-1'>
                  <img src={tokenImage} alt={`${symbol} token`} className='h-5 w-5' />

                  <p className='font-jb-mono'>
                    {!isUndefined(tokenBalance) ? formatUnits(tokenBalance as bigint, token?.decimals || 18) : '??'}
                  </p>
                  <p className='font-jb-mono text-gray-500'>{symbol}</p>
                </div>
              </div>

              <div className='flex w-1/3 flex-col items-center gap-2 md:min-w-[110px]'>
                <h2 className='text-sm uppercase'>Your allowance</h2>

                <div className='flex items-center gap-1'>
                  <img src={tokenImage} alt={`${symbol} token`} className='h-5 w-5' />

                  <p className='font-jb-mono'>
                    {!isUndefined(allowance) ? formatUnits(allowance as bigint, token?.decimals || 18) : '??'}
                  </p>
                  <p className='font-jb-mono text-gray-500'>{symbol}</p>
                </div>
              </div>

              <div className='flex w-1/3 flex-col items-center gap-2 md:min-w-[110px]'>
                <h2 className='text-sm uppercase'>Subscription status</h2>

                <div className='flex items-center gap-1'>
                  <p className='font-jb-mono'>{activeSubscription ? 'Subscribed' : 'Not subscribed'}</p>
                </div>
              </div>
            </div>

            {address && (
              <div className='flex h-[50px] flex-col items-center justify-around gap-2 md:flex-row md:justify-between md:gap-6'>
                {!!hasTokenAllowance && (
                  <TransactionButton
                    sendTx={async () => {
                      if (!zeroApprovalParams) throw new Error('Zero approval params not found');
                      return writeContractAsync(zeroApprovalParams);
                    }}
                    afterSuccess={() => {
                      queryClient.invalidateQueries({ queryKey: ['readContracts'] });
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
                    if (!unlimitedApprovalParams) throw new Error('Unlimited approval params not found');
                    return writeContractAsync(unlimitedApprovalParams);
                  }}
                  afterSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['readContracts'] });
                  }}
                  variant='link'
                  disabled={!isUndefined(allowance) && BigInt(allowance) === maxUint256}
                  txDescription='Cancel subscription for Hat'
                  chainId={chainId}
                >
                  <BsArrowUpRightCircle />
                  Authorize unlimited withdrawals
                </TransactionButton>
              </div>
            )}

            <div className='flex justify-end'>
              <div className='flex items-center gap-2'>
                <div>
                  {!hasTokenBalance && hasTokenAllowance && (
                    <p className='text-sm text-red-500'>
                      You'll need at least {price || '??'} {symbol} to subscribe
                    </p>
                  )}
                  {!hasTokenAllowance && (
                    <p className='text-sm text-red-500'>
                      You'll need to approve at least {price || '??'} {symbol} to subscribe
                    </p>
                  )}
                </div>
                <TransactionButton
                  sendTx={async () => {
                    if (!subscribeParams) throw new Error('Subscribe params not found');
                    // TODO handle re-subscribe
                    return writeContractAsync(subscribeParams);
                  }}
                  afterSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['readContracts'] });
                  }}
                  disabled={activeSubscription || (!isUndefined(allowance) && BigInt(allowance) < BigInt(price || 0))}
                  txDescription='Subscribe to Hats Pro'
                  chainId={chainId}
                >
                  <BsArrowUpRightCircle />
                  {activeSubscription ? 'Subscribed' : 'Subscribe'}
                </TransactionButton>
              </div>
            </div>
          </div>
        </Form>

        <div className='flex w-full justify-between'>
          <h2>Subscription History</h2>

          {}
        </div>
      </Card>

      <div className='mx-auto flex w-1/2 flex-col gap-2 p-10'>
        <h2 className='text-center font-medium'>Unlock Subscription Dev</h2>

        <div className='flex w-full justify-between'>
          <p>Lock Address</p>
          <Link
            href={`${explorerUrl(chainId as SupportedChains)}/address/${HATS_PRO_LOCKS[chainId as SupportedChains]}`}
            isExternal
          >
            {formatAddress(HATS_PRO_LOCKS[chainId as SupportedChains])}
          </Link>
        </div>

        <div className='flex w-full justify-between'>
          <p>Key Balance</p>
          <p>{keyBalance}</p>
        </div>

        <div className='flex w-full justify-between'>
          <p>Key Expiration Timestamp</p>
          <p>{keyExpirationTimestamp}</p>
        </div>
      </div>
    </div>
  );
};

export { UnlockSubscriptionDev };
