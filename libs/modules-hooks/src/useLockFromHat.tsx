import { ModuleParameter } from '@hatsprotocol/modules-sdk';
import { PublicLockV14 } from '@unlock-protocol/contracts';
import { find, get, map } from 'lodash';
import { erc20Abi, formatUnits, Hex, zeroAddress } from 'viem';
import { useAccount, useReadContracts } from 'wagmi';

interface ContractLookup {
  address: any;
  abi: any;
  functionName: string;
  args: string[];
  chainId: any;
}

export const useLockFromHat = ({
  moduleParameters,
  chainId,
}: {
  moduleParameters: ModuleParameter[] | undefined;
  chainId: number | undefined;
}) => {
  const { address } = useAccount();

  const lockAddress = get(
    find(moduleParameters, { label: 'Lock Contract' }),
    'value',
  ) as Hex;

  const contractLockProperties: ContractLookup[] = [
    {
      address: lockAddress,
      abi: PublicLockV14.abi,
      functionName: 'tokenAddress',
      args: [],
      chainId,
    },
    {
      address: lockAddress,
      abi: PublicLockV14.abi,
      functionName: 'purchasePriceFor',
      args: [address!, address!, ''],
      chainId,
    },
    {
      address: lockAddress,
      abi: PublicLockV14.abi,
      functionName: 'expirationDuration',
      args: [],
      chainId,
    },
    {
      address: lockAddress,
      abi: PublicLockV14.abi,
      functionName: 'balanceOf',
      args: [address!],
      chainId,
    },
  ];

  const { data: lockProperties, isLoading: isLoadingLockProperties } =
    useReadContracts({
      contracts: contractLockProperties as any,
    });
  const [tokenAddress, purchasePrice, durationInSeconds, keyBalance] = map(
    lockProperties,
    'result',
  ) as [string, bigint, bigint, bigint];

  const currencyContract = {
    address: tokenAddress,
    abi: erc20Abi,
    chainId,
    enabled: tokenAddress && tokenAddress !== zeroAddress,
  };

  const tokenPropertiesRequests = [
    {
      ...currencyContract,
      functionName: 'symbol',
    },
    {
      ...currencyContract,
      functionName: 'decimals',
    },
    {
      ...currencyContract,
      functionName: 'allowance',
      args: [address!, lockAddress],
      enabled: tokenAddress !== zeroAddress && !!lockAddress && !!address,
    },
  ];

  const { data: tokenProperties, isLoading: isLoadingTokenProperties } =
    useReadContracts({
      contracts: tokenPropertiesRequests as any,
    });
  const [tokenSymbol, tokenDecimals, tokenAllowance] = map(
    tokenProperties,
    'result',
  ) as [string, bigint, bigint];

  if (
    isLoadingLockProperties ||
    isLoadingTokenProperties ||
    !lockProperties ||
    !tokenProperties
  )
    return { isLoading: true };

  let duration;
  if (durationInSeconds < Number.MAX_SAFE_INTEGER) {
    duration = Number(durationInSeconds) / (60 * 60 * 24);
  }

  const formattedPrice = purchasePrice
    ? formatUnits(purchasePrice, Number(tokenDecimals))
    : undefined;

  return {
    currencyContract: tokenAddress || zeroAddress,
    price: formattedPrice,
    symbol: tokenSymbol ? tokenSymbol : 'ETH',
    decimals: tokenDecimals ? tokenDecimals : 18n,
    duration,
    keyPrice: purchasePrice,
    lockAddress,
    keyBalance,
    allowance: tokenAllowance,
  };
};
