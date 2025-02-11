'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useOverlay } from 'contexts';
import { useHatContractWrite, useHatDetails } from 'hats-hooks';
import { useToast, useWaitForSubgraph } from 'hooks';
import { find, get, includes, map } from 'lodash';
import { useState } from 'react';
import { BsCheckSquareFill, BsXSquare, BsXSquareFill } from 'react-icons/bs';
import type { StatusManagerProps, SupportedChains } from 'types';
import { Button, Skeleton } from 'ui';
import { erc20Abi, formatUnits, Hex } from 'viem';
import { useReadContracts } from 'wagmi';

const Erc20StatusManager = ({ rule, user, selectedHat, chainId, currentEligibility }: StatusManagerProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { setModals, handlePendingTx } = useOverlay();
  const queryClient = useQueryClient();
  const waitForSubgraph = useWaitForSubgraph({ chainId: chainId as SupportedChains });
  const { data: hatDetails, isLoading: hatDetailsLoading } = useHatDetails({
    hatId: selectedHat?.id,
    chainId: chainId as SupportedChains,
  });
  const isEligible =
    get(currentEligibility, `[${rule.address}].eligible`) && get(currentEligibility, `[${rule.address}].goodStanding`);
  const isWearing = includes(map(get(hatDetails, 'wearers'), 'id'), user?.address);

  const tokenAddress = get(find(rule.liveParams, { label: 'Token Address' }), 'value') as `0x${string}` | undefined;
  const tokenThreshold = get(find(rule.liveParams, { label: 'Minimum Balance' }), 'value') as bigint | undefined;

  const { data: tokenDetails, isLoading: tokenDetailsLoading } = useReadContracts({
    contracts:
      !!tokenAddress && !!user?.address
        ? [
            {
              address: tokenAddress,
              abi: erc20Abi,
              functionName: 'symbol',
            },
            {
              address: tokenAddress,
              abi: erc20Abi,
              functionName: 'name',
            },
            {
              address: tokenAddress,
              abi: erc20Abi,
              functionName: 'decimals',
            },
            {
              address: tokenAddress,
              abi: erc20Abi,
              functionName: 'balanceOf',
              args: [user.address as Hex],
            },
          ]
        : undefined,
  });
  const [, tokenName, decimals, balance] = map(tokenDetails, 'result');
  const formattedBalance = balance ? formatUnits(balance as bigint, decimals as number) : undefined;
  const convertedThreshold =
    tokenThreshold && decimals ? tokenThreshold / BigInt(10 ** (decimals as number)) : undefined;
  const formattedThreshold = tokenThreshold ? formatUnits(tokenThreshold, decimals as number) : undefined;

  const { writeAsync } = useHatContractWrite({
    functionName: 'checkWearerStatus',
    chainId: chainId as SupportedChains,
    args: [user?.address as Hex],
    txDescription: 'Updated Wearer Status',
    handlePendingTx,
    waitForSubgraph,
    handleSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hatDetails', selectedHat?.id] });
      toast({
        title: 'Wearer Status Updated',
        description: 'The wearer status has been updated successfully',
      });
      setModals?.({});
      setIsLoading(false);
    },
    // onDecline: () => {
    //   setIsLoading(false);
    // },
  });

  const handleUpdateWearerStatus = async () => {
    await writeAsync();
  };

  if (hatDetailsLoading || tokenDetailsLoading) {
    return (
      <div className='flex items-center justify-between'>
        <div className='flex flex-col gap-1'>
          <Skeleton className='h-4 w-12' />
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-4 w-6' />
        </div>

        <Skeleton className='h-6 w-12' />
      </div>
    );
  }

  return (
    <div className='flex items-center justify-between gap-8'>
      <div className='flex flex-col gap-1'>
        <h4 className='font-medium'>
          Holds {formattedThreshold} {tokenName} Token{convertedThreshold === BigInt(1) ? '' : 's'}
        </h4>
        <p className='text-sm'>
          {isEligible
            ? `This Member holds more than ${formattedThreshold} ${tokenName} Token${convertedThreshold === BigInt(1) ? '' : 's'}`
            : `This Member holds less than ${formattedThreshold} ${tokenName} Token${convertedThreshold === BigInt(1) ? '' : 's'}`}
        </p>
        {isEligible ? (
          <div className='text-functional-success flex items-center gap-2'>
            <BsCheckSquareFill className='size-4' />
            <p>
              {formattedBalance} {tokenName}
            </p>
          </div>
        ) : (
          <div className='text-destructive flex items-center gap-2'>
            <BsXSquareFill className='size-4' />
            <p>
              {formattedBalance} {tokenName}
            </p>
          </div>
        )}
      </div>

      {isWearing && !isEligible && (
        <Button variant='outline-red' rounded='full' onClick={handleUpdateWearerStatus} disabled={isLoading}>
          <BsXSquare className='size-4' />
          {isLoading ? 'Updating...' : 'Remove'}
        </Button>
      )}
    </div>
  );
};

export { Erc20StatusManager };
