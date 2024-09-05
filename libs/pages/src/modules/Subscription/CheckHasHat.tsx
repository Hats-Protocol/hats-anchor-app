import { useWearerDetails } from 'hats-hooks';
import React from 'react';
import { AppHat } from 'types';
import { useAccount } from 'wagmi';

export const CheckHasHat = ({
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

  const { data: wearerDetails, isLoading: isLoadingWearerDetails } =
    useWearerDetails({
      wearerAddress: address,
      chainId,
    });

  if (isLoadingWearerDetails) {
    return <p>Loading</p>;
  }

  const hasHat =
    wearerDetails &&
    selectedHat &&
    !!wearerDetails.find((hatDetails) => hatDetails.id === selectedHat.id);

  if (hasHat) {
    return hasHatChild;
  }

  return children;
};

export default CheckHasHat;
