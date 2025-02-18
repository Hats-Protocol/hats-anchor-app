'use client';

import { useEligibility } from 'contexts';
import { ClaimButton } from 'modules-ui';
import dynamic from 'next/dynamic';
import React from 'react';
import { Skeleton } from 'ui';
import { useChainId } from 'wagmi';

import { BottomMoreMenu } from './bottom-more-menu';

const NetworkSwitcher = dynamic(() => import('molecules').then((mod) => mod.NetworkSwitcher));

const MenuWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='fixed bottom-0 z-[14] w-full bg-white/90'>
      <div className='flex items-center justify-between border-t border-gray-200 p-2 md:flex-row-reverse'>
        {children}
      </div>
    </div>
  );
};

export const StandaloneBottomMenu = () => {
  const currentNetworkId = useChainId();
  const { chainId, isHatDetailsLoading, isEligibilityRulesLoading } = useEligibility();

  if (!currentNetworkId || !chainId || isHatDetailsLoading || isEligibilityRulesLoading) {
    return (
      <MenuWrapper>
        <Skeleton className='h-full min-h-[40px] w-1/4 rounded-md md:w-[250px]' />

        <Skeleton className='h-full min-h-[40px] w-1/4 rounded-md md:w-[100px]' />
      </MenuWrapper>
    );
  }

  if (currentNetworkId !== chainId) {
    return (
      <MenuWrapper>
        <NetworkSwitcher chainId={chainId} />

        <BottomMoreMenu />
      </MenuWrapper>
    );
  }

  return (
    <MenuWrapper>
      <ClaimButton />

      <BottomMoreMenu />
    </MenuWrapper>
  );
};
