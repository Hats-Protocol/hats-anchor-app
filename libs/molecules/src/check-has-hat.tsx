'use client';

import { useWearerDetails } from 'hats-hooks';
import React from 'react';
import { AppHat } from 'types';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

const CheckHasHat = ({
  selectedHat,
  hasHatChild,
  children,
  chainId,
}: {
  selectedHat: AppHat | null | undefined;
  hasHatChild: React.ReactNode;
  children: React.ReactNode;
  chainId: number;
}) => {
  const { address } = useAccount();

  const { data: wearerDetails, isLoading: isLoadingWearerDetails } = useWearerDetails({
    wearerAddress: address as Hex,
    chainId,
  });

  if (isLoadingWearerDetails) {
    return <p>Loading</p>;
  }

  const hasHat = wearerDetails && selectedHat && !!wearerDetails.find((hatDetails) => hatDetails.id === selectedHat.id);

  if (hasHat) {
    return hasHatChild;
  }

  return children;
};

export { CheckHasHat };
