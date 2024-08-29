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

export const useLockFromHat = ({ moduleParameters, chainId }) => {
  const { address } = useAccount();

  const lockAddress = moduleParameters?.filter(
    (param) => param.label === 'Lock Contract',
  )[0].value;

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
      args: [address, address, ''],
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

  const lockPropertiesRequests = useReadContracts({
    contracts: contractLockProperties,
  });

  const currencyContract = lockPropertiesRequests?.data
    ? lockPropertiesRequests?.data[0].result
    : '';

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

  const durationInSeconds = get(lockPropertiesRequests, 'data[2].result');
  let duration;
  if (durationInSeconds < Number.MAX_SAFE_INTEGER) {
    duration = Number(durationInSeconds) / (60 * 60 * 24);
  }

  let symbol;
  let decimals;
  if (currencyContract === zeroAddress) {
    symbol = 'ETH'; // TODO: can we get this from wagmi?
    decimals = 18;
  } else {
    symbol = tokenPropertiesRequests.data[0].result;
    decimals = tokenPropertiesRequests.data[1].result;
  }
  const keyPrice = lockPropertiesRequests.data[1].result;
  const price = lockPropertiesRequests.data[1].result
    ? formatUnits(lockPropertiesRequests.data[1].result, decimals)
    : undefined;

  return {
    currencyContract,
    price,
    symbol,
    duration,
    keyPrice,
    lockAddress,
  };
};
