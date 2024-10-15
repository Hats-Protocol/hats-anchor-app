'use client';

import { Box } from '@chakra-ui/react';
import { ModuleParameter } from '@hatsprotocol/modules-sdk';
import { useEligibility } from 'contexts';
import { compact, isUndefined } from 'lodash';
import { useLockFromHat } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { formatUnits } from 'viem';

const DevInfo = dynamic(() => import('ui').then((mod) => mod.DevInfo));
const DefaultInfo = dynamic(() => import('ui').then((mod) => mod.DefaultInfo));
const AddressInfo = dynamic(() => import('ui').then((mod) => mod.AddressInfo));

export const SubscriptionDevInfo = ({
  moduleParameters,
  chainId,
}: SubscriptionDevInfoProps) => {
  const { selectedHat } = useEligibility();
  const {
    price,
    decimals,
    symbol,
    currencyContract,
    lockAddress,
    tokenBalance,
    keyBalance,
    allowance,
  } = useLockFromHat({
    moduleParameters,
    chainId,
  });

  const moduleDescriptors = useMemo(() => {
    return compact([
      !isUndefined(allowance) && {
        label: 'Allowance',
        descriptor: (
          <DefaultInfo>{`${formatUnits(allowance, Number(decimals))} ${symbol}`}</DefaultInfo>
        ),
      },
      !isUndefined(tokenBalance) && {
        label: 'Token Balance',
        descriptor: (
          <DefaultInfo>{`${formatUnits(tokenBalance, Number(decimals))} ${symbol}`}</DefaultInfo>
        ),
      },
      !isUndefined(keyBalance) && {
        label: 'Key Balance',
        descriptor: (
          <DefaultInfo>{`${keyBalance.toString()} keys`}</DefaultInfo>
        ),
      },
      !isUndefined(price) && {
        label: 'Price',
        descriptor: <DefaultInfo>{`${price} ${symbol}`}</DefaultInfo>,
      },
      !isUndefined(lockAddress) && {
        label: 'Lock Address',
        descriptor: <AddressInfo address={lockAddress} chainId={chainId} />,
      },
      !isUndefined(currencyContract) && {
        label: 'Currency Contract',
        descriptor: (
          <AddressInfo address={currencyContract} chainId={chainId} />
        ),
      },
      !isUndefined(selectedHat) && {
        label: 'Hat Supply',
        descriptor: (
          <DefaultInfo>
            {`${selectedHat?.currentSupply} / ${selectedHat?.maxSupply}`}
          </DefaultInfo>
        ),
      },
    ]);
  }, [
    keyBalance,
    tokenBalance,
    allowance,
    decimals,
    symbol,
    price,
    lockAddress,
    chainId,
    currencyContract,
  ]);

  return (
    <Box maxW='350px'>
      <DevInfo devInfos={moduleDescriptors} />
    </Box>
  );
};

interface SubscriptionDevInfoProps {
  moduleParameters: ModuleParameter[];
  chainId: number | undefined;
}
