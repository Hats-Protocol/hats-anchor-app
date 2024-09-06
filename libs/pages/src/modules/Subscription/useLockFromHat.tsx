import { ModuleParameter } from '@hatsprotocol/modules-sdk';
import { PublicLockV14 } from '@unlock-protocol/contracts';
import { get } from 'lodash';
import { erc20Abi, formatUnits, zeroAddress } from 'viem';
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

  const lockAddress = moduleParameters?.filter(
    (param) => param.label === 'Lock Contract',
  )[0].value as `0x${string}`;

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
  ];

  const lockPropertiesParams = {
    contracts: contractLockProperties,
  };

  // @ts-ignore
  const lockPropertiesRequests = useReadContracts(lockPropertiesParams);

  const currencyContract = (
    lockPropertiesRequests?.data
      ? lockPropertiesRequests?.data[0].result
      : zeroAddress
  ) as `0x${string}`;

  const tokenProperties = [
    {
      address: currencyContract,
      abi: erc20Abi,
      functionName: 'symbol',
      args: [],
      chainId,
      enabled: currencyContract !== zeroAddress,
    },
    {
      address: currencyContract,
      abi: erc20Abi,
      functionName: 'decimals',
      args: [],
      chainId,
      enabled: currencyContract !== zeroAddress,
    },
  ];
  const tokenPropertiesRequests = useReadContracts({
    contracts: tokenProperties,
  });

  if (
    lockPropertiesRequests.isLoading ||
    tokenPropertiesRequests.isLoading ||
    !lockPropertiesRequests.data ||
    !tokenPropertiesRequests.data
  )
    return { isLoading: true };

  const durationInSeconds = get(
    lockPropertiesRequests,
    'data[2].result',
  ) as bigint;
  let duration;
  if (durationInSeconds < Number.MAX_SAFE_INTEGER) {
    duration = Number(durationInSeconds) / (60 * 60 * 24);
  }

  let symbol = 'ETH';
  let decimals = 18n;
  if (currencyContract === zeroAddress) {
    symbol = 'ETH'; // TODO: can we get this from wagmi?
    decimals = 18n;
  } else {
    symbol = (tokenPropertiesRequests.data[0].result as string) || '';
    decimals = tokenPropertiesRequests.data[1].result as bigint;
  }

  const keyPrice = lockPropertiesRequests.data[1].result as bigint;
  const price = formatUnits(
    lockPropertiesRequests.data[1].result as bigint,
    Number(decimals),
  );

  return {
    currencyContract,
    price,
    symbol,
    duration,
    keyPrice,
    lockAddress,
  };
};
