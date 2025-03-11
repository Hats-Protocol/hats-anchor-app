import { PublicLockV14 } from '@unlock-protocol/contracts';
import { compact, map } from 'lodash';
import { useMemo } from 'react';
import { Abi, erc20Abi, formatUnits, Hex, zeroAddress } from 'viem';
import { useAccount, useReadContracts } from 'wagmi';

const useLock = ({ lockAddress, chainId }: { lockAddress: Hex | undefined; chainId: number | undefined }) => {
  const { address } = useAccount();

  const lockContractProperties = useMemo(() => {
    if (!lockAddress) return undefined;

    const lockContract = {
      address: lockAddress,
      abi: PublicLockV14.abi as Abi,
      chainId,
    };

    return compact([
      {
        ...lockContract,
        abi: PublicLockV14.abi as Abi,
        functionName: 'tokenAddress',
        args: [],
      },
      {
        ...lockContract,
        functionName: 'expirationDuration',
        args: [],
      },
      address && {
        ...lockContract,
        functionName: 'purchasePriceFor',
        args: [address!, address!, ''],
      },
      address && {
        ...lockContract,
        functionName: 'balanceOf',
        args: [address!],
      },
      address && {
        ...lockContract,
        functionName: 'keyExpirationTimestampFor',
        args: [address!],
      },
      address && {
        ...lockContract,
        functionName: 'totalKeys',
        args: [address!],
      },
    ]);
  }, [lockAddress, chainId, address]);

  const { data: lockProperties, isLoading: isLoadingLockProperties } = useReadContracts({
    contracts: lockContractProperties as readonly unknown[],
  });
  const [tokenAddress, durationInSeconds, purchasePrice, keyBalance, keyExpirationTimestamp] = map(
    lockProperties,
    'result',
  ) as [string, bigint, bigint, bigint, bigint];

  const currencyContract = {
    address: tokenAddress,
    abi: erc20Abi as Abi,
    chainId,
    enabled: tokenAddress && tokenAddress !== zeroAddress,
  };

  const tokenPropertiesRequests = compact([
    {
      ...currencyContract,
      functionName: 'symbol',
    },
    {
      ...currencyContract,
      functionName: 'decimals',
    },
    address && {
      ...currencyContract,
      functionName: 'allowance',
      args: [address!, lockAddress],
      enabled: tokenAddress !== zeroAddress && !!lockAddress && !!address,
    },
    address && {
      ...currencyContract,
      functionName: 'balanceOf',
      args: [address!],
      enabled: tokenAddress !== zeroAddress && !!address,
    },
  ]);

  const { data: tokenProperties, isLoading: isLoadingTokenProperties } = useReadContracts({
    contracts: tokenPropertiesRequests as readonly unknown[],
  });
  const [tokenSymbol, tokenDecimals, tokenAllowance, tokenBalance] = map(tokenProperties, 'result') as [
    string,
    bigint,
    bigint,
    bigint,
  ];

  if (isLoadingLockProperties || isLoadingTokenProperties || !lockProperties || !tokenProperties)
    return { isLoading: true };

  let duration;
  if (durationInSeconds < Number.MAX_SAFE_INTEGER) {
    duration = Number(durationInSeconds) / (60 * 60 * 24); // convert to days
  }

  const formattedPrice = purchasePrice ? formatUnits(purchasePrice, Number(tokenDecimals)) : undefined;

  return {
    currencyContract: tokenAddress || zeroAddress,
    price: formattedPrice,
    symbol: tokenSymbol ? tokenSymbol : 'ETH',
    decimals: tokenDecimals ? tokenDecimals : 18n,
    duration,
    keyPrice: purchasePrice,
    lockAddress,
    keyBalance,
    tokenBalance,
    allowance: tokenAllowance,
    keyExpirationTimestamp,
  };
};

export { useLock };
