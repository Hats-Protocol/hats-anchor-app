'use client';

import { CHAIN_TOKENS } from '@hatsprotocol/constants';
import { useEligibility } from 'contexts';
import { find, get, pick } from 'lodash';
import { useErc20Details } from 'modules-hooks';
import { DevInfo } from 'molecules';
import { useMemo } from 'react';
import { BsCheckSquareFill, BsFillXOctagonFill } from 'react-icons/bs';
import { LuBarChart2, LuWallet } from 'react-icons/lu';
import { LabeledModules, ModuleDetails } from 'types';
import { Card, cn, Link, Skeleton } from 'ui';
import { explorerUrl, formatAddress, ipfsUrl } from 'utils';
import { formatUnits, Hex } from 'viem';
import { useAccount, useEnsName } from 'wagmi';

interface Erc20Details {
  userBalance: bigint;
  userBalanceDisplay: string;
  tokenDetails: {
    symbol: string;
    name: string;
    decimals: number;
  };
}

const inputClass =
  'border-input flex w-full items-center rounded-md border bg-gray-50 px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium';

export const Erc20Claims = ({
  activeModule,
  labeledModules,
}: {
  activeModule: ModuleDetails;
  labeledModules: LabeledModules | undefined;
}) => {
  const { chainId, isEligibilityRulesLoading } = useEligibility();
  const { address } = useAccount();
  const { data: ensName } = useEnsName({ address: address as `0x${string}`, chainId: 1 });

  const tokenParam = find(get(activeModule, 'liveParameters'), { displayType: 'erc20' });
  const amountParameter = find(get(activeModule, 'liveParameters'), ['displayType', 'amountWithDecimals']);

  // Get token logo from CHAIN_TOKENS
  const token = CHAIN_TOKENS[chainId || 1]?.find((t) => {
    const tokenAddress = tokenParam?.value as string;
    return tokenAddress ? t.address.toLowerCase() === tokenAddress.toLowerCase() : false;
  });
  const tokenLogoUrl = token?.logoURI ? ipfsUrl(token.logoURI) : '';

  const { data: erc20Details, isLoading: isErc20Loading } = useErc20Details({
    contractAddress: tokenParam?.value as Hex,
    wearerAddress: address as Hex,
    chainId,
  });

  const { userBalance, userBalanceDisplay, tokenDetails } = pick(erc20Details || {}, [
    'userBalance',
    'userBalanceDisplay',
    'tokenDetails',
  ]) as Partial<Erc20Details>;

  const minimumBalance = amountParameter?.value as bigint;
  const minimumBalanceDisplay = minimumBalance ? formatUnits(minimumBalance, tokenDetails?.decimals || 18) : undefined;
  const minimumBalanceNumber = minimumBalanceDisplay ? parseFloat(minimumBalanceDisplay) : 0;

  const hasEnoughTokens = userBalance && minimumBalance ? userBalance >= minimumBalance : false;

  const userDisplay = ensName || (address ? formatAddress(address) : '');

  const devInfo = useMemo(() => {
    return [
      {
        label: 'Module Address',
        descriptor: (
          <Link href={`${explorerUrl(chainId)}/address/${activeModule.instanceAddress}`} isExternal>
            {formatAddress(activeModule.instanceAddress)}
          </Link>
        ),
      },
      {
        label: 'Token Address',
        descriptor: tokenParam?.value ? (
          <Link href={`${explorerUrl(chainId)}/address/${tokenParam.value}`} isExternal>
            {formatAddress(tokenParam.value as string)}
          </Link>
        ) : (
          'Not set'
        ),
      },
    ];
  }, [activeModule.instanceAddress, chainId, tokenParam?.value]);

  const isDev = true;

  if (isEligibilityRulesLoading || isErc20Loading) {
    return (
      <Card className='flex flex-col border-[#2D3748] bg-white px-8 py-6'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-8 w-64' />
          <Skeleton className='h-8 w-24' />
        </div>
        <div className='mt-8 grid grid-cols-3 gap-8'>
          <div>
            <Skeleton className='mb-4 h-6 w-32' />
            <Skeleton className='h-16 w-full' />
          </div>
          <div>
            <Skeleton className='mb-4 h-6 w-32' />
            <Skeleton className='h-16 w-full' />
          </div>
          <div>
            <Skeleton className='mb-4 h-6 w-32' />
            <Skeleton className='h-16 w-full' />
          </div>
        </div>
      </Card>
    );
  }

  if (!address) {
    return (
      <Card className='flex flex-col items-center justify-center border-[#2D3748] px-8 py-12'>
        <LuWallet className='mb-4 h-12 w-12 text-gray-400' />
        <p className='text-lg font-medium text-gray-600'>Connect your wallet to check eligibility</p>
      </Card>
    );
  }

  return (
    <div className='flex flex-col gap-4'>
      <Card className='flex flex-col border-[#2D3748] bg-white px-8 py-6'>
        <div className='flex items-center justify-between'>
          <h3 className='text-2xl font-bold'>
            Hold {minimumBalanceNumber === 1 ? '1' : minimumBalanceDisplay} {tokenDetails?.symbol}{' '}
            {minimumBalanceNumber === 1 ? 'Token' : 'Tokens'}
          </h3>
          {hasEnoughTokens ? (
            <div className='flex items-center gap-2'>
              <div className='bg-functional-success/10 flex items-center gap-2 rounded-md px-2 py-1'>
                <span className='text-functional-success'>Yes</span>
                <BsCheckSquareFill className='text-functional-success h-4 w-4' />
              </div>
            </div>
          ) : (
            <div className='flex items-center gap-2'>
              <div className='flex items-center gap-2 rounded-md px-2 py-1'>
                <span className='text-destructive'>No</span>
                <BsFillXOctagonFill className='text-destructive h-4 w-4' />
              </div>
            </div>
          )}
        </div>

        <div className='mt-8 grid grid-cols-3 gap-8'>
          <div>
            <h4 className='text-primary mb-4 text-base font-bold'>Token Limit</h4>
            <div className={cn(inputClass, 'flex items-center p-0')}>
              <div className='border-input flex items-center border-r bg-gray-100 px-3 py-2'>
                <span className='text-gray-600'>Minimum:</span>
              </div>
              <div className='flex items-center px-3 py-2'>
                <div className='flex items-center gap-2'>
                  {/* {tokenLogoUrl ? (
                    <img src={tokenLogoUrl} alt={tokenDetails?.symbol} className='h-5 w-5 rounded-full' />
                  ) : (
                    <div className='h-5 w-5 rounded-full bg-black' />
                  )} We can add this back in if we want to show the token logo here as well */}
                  <span className='font-mono'>
                    {minimumBalanceDisplay} {tokenDetails?.symbol}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className='text-primary mb-4 text-base font-bold'>Your Balance</h4>
            <div className={cn(inputClass, 'justify-between')}>
              <div className='flex items-center gap-2'>
                {userBalance ? (
                  <>
                    {hasEnoughTokens ? (
                      <BsCheckSquareFill className='text-functional-success size-4' />
                    ) : (
                      <BsFillXOctagonFill className='text-destructive h-4 w-4' />
                    )}
                    <div className='flex items-center gap-2'>
                      {tokenLogoUrl ? (
                        <img src={tokenLogoUrl} alt={tokenDetails?.symbol} className='h-5 w-5 rounded-full' />
                      ) : (
                        <div className='h-5 w-5 rounded-full bg-black' />
                      )}
                      <span className='font-mono'>
                        {userBalanceDisplay} {tokenDetails?.symbol}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <BsFillXOctagonFill className='text-destructive h-4 w-4' />
                    <span className='font-mono'>0 {tokenDetails?.symbol}</span>
                  </>
                )}
              </div>
              <LuBarChart2 className='h-4 w-4 text-gray-400' />
            </div>
          </div>

          <div>
            <h4 className='text-primary mb-4 text-base font-bold'>Token Type</h4>
            <div className={cn(inputClass, 'justify-between')}>
              <div className='flex items-center gap-2'>
                {tokenDetails ? (
                  <>
                    {tokenLogoUrl ? (
                      <img src={tokenLogoUrl} alt={tokenDetails.symbol} className='h-5 w-5 rounded-full' />
                    ) : (
                      <div className='h-5 w-5 rounded-full bg-black' />
                    )}
                    <span className='font-mono'>
                      {tokenDetails.symbol} ({tokenDetails.name})
                    </span>
                  </>
                ) : (
                  <span className='text-gray-500'>Token details not available</span>
                )}
              </div>
              <LuBarChart2 className='h-4 w-4 text-gray-400' />
            </div>
          </div>
        </div>

        <div className='mt-6 text-sm text-gray-600'>
          <span className='font-medium'>Note: </span>
          Once you have less than {minimumBalanceDisplay} {tokenDetails?.symbol} on{' '}
          <span className='font-jb-mono text-sm text-gray-600'>{userDisplay}</span>, you will be instantly removed from
          the council.
        </div>
      </Card>

      {isDev && (
        <div className='max-w-[300px]'>
          <DevInfo devInfos={devInfo} />
        </div>
      )}
    </div>
  );
};
