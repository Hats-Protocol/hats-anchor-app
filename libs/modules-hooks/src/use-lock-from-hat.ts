import { ModuleParameter } from '@hatsprotocol/modules-sdk';
import { PublicLockV14 } from '@unlock-protocol/contracts';
import { compact, find, get, map } from 'lodash';
import { Abi, erc20Abi, formatUnits, Hex, zeroAddress } from 'viem';
import { useAccount, useReadContracts } from 'wagmi';

interface ContractLookup {
  address: Hex;
  abi: Abi;
  functionName: string;
  args: string[];
  chainId: number | undefined;
}

const useLockFromHat = ({
  moduleParameters,
  chainId,
}: {
  moduleParameters: ModuleParameter[] | undefined;
  chainId: number | undefined;
}) => {
  const { address } = useAccount();

  const lockAddress = get(find(moduleParameters, { label: 'Lock Contract' }), 'value') as Hex;

  const contractLockProperties: ContractLookup[] = compact([
    {
      address: lockAddress,
      abi: PublicLockV14.abi as Abi,
      functionName: 'tokenAddress',
      args: [],
      chainId,
    },
    {
      address: lockAddress,
      abi: PublicLockV14.abi as Abi,
      functionName: 'expirationDuration',
      args: [],
      chainId,
    },
    address && {
      address: lockAddress,
      abi: PublicLockV14.abi as Abi,
      functionName: 'purchasePriceFor',
      args: [address!, address!, ''],
      chainId,
    },
    address && {
      address: lockAddress,
      abi: PublicLockV14.abi as Abi,
      functionName: 'balanceOf',
      args: [address!],
      chainId,
    },
  ]);

  const { data: lockProperties, isLoading: isLoadingLockProperties } = useReadContracts({
    contracts: contractLockProperties as readonly unknown[],
  });
  const [tokenAddress, durationInSeconds, purchasePrice, keyBalance] = map(lockProperties, 'result') as [
    string,
    bigint,
    bigint,
    bigint,
  ];

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
  };
};

export { useLockFromHat };
