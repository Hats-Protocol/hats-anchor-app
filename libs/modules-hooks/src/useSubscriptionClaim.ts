import { CLAIM_STATUS } from '@hatsprotocol/constants';
import { Module, ModuleParameter } from '@hatsprotocol/modules-sdk';
import { useQueryClient } from '@tanstack/react-query';
import { PublicLockV14 } from '@unlock-protocol/contracts';
import { useToast, useWaitForSubgraph } from 'hooks';
import { isUndefined } from 'lodash';
import {
  invalidateAfterTransaction,
  REFERRAL_ADDRESS,
  viemPublicClient,
} from 'utils';
import { Abi, zeroAddress } from 'viem';
import { useAccount, useWriteContract } from 'wagmi';

import { useLockFromHat } from './useLockFromHat';

// TODO replace where we get the ABI from
// TODO check that eligibility module is wearing admin hat (handles its own claiming)

export const useSubscriptionClaim = ({
  moduleParameters,
  chainId,
  setStatus,
}: UseSubscriptionClaimProps) => {
  const { address } = useAccount();
  const toast = useToast();
  const { writeContractAsync } = useWriteContract();
  const queryClient = useQueryClient();
  const {
    keyPrice,
    price,
    currencyContract,
    lockAddress,
    allowance,
    tokenBalance,
    symbol,
  } = useLockFromHat({
    moduleParameters,
    chainId,
  });
  const waitForSubgraph = useWaitForSubgraph({ chainId });

  const lockContract = {
    abi: PublicLockV14.abi as Abi,
    address: lockAddress,
  } as const;

  const purchaseHat = async () => {
    return writeContractAsync({
      ...lockContract,
      functionName: 'purchase',
      args: [
        [keyPrice], // values
        [address], // recipients
        [REFERRAL_ADDRESS], // referral
        [address], // keyManagers
        ['0x'], // data (empty)
      ],
      chainId,
      value: currencyContract !== zeroAddress ? 0n : keyPrice,
    } as any)
      .then(async (hash) => {
        if (!chainId) return;
        const client = viemPublicClient(chainId);
        return client
          .waitForTransactionReceipt({ hash })
          .then(async (receipt) => {
            await waitForSubgraph(receipt);

            await invalidateAfterTransaction(chainId, hash);

            queryClient.invalidateQueries({ queryKey: ['wearerDetails'] });
            queryClient.invalidateQueries({ queryKey: ['hatDetails'] });
            queryClient.invalidateQueries({ queryKey: ['treeDetails'] });
            queryClient.invalidateQueries({ queryKey: ['readContracts'] });
            // refetchBalances();
            setStatus(CLAIM_STATUS.SUCCESS);
          });
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.log(err);
        if (err.message.includes('User rejected the request')) {
          toast.error({
            title: 'Transaction failed',
            description: 'User rejected the request',
          });
        }
        setStatus(CLAIM_STATUS.FAILED);
      });
  };

  const disableClaim =
    !lockAddress ||
    !keyPrice ||
    !currencyContract ||
    allowance < keyPrice ||
    tokenBalance < keyPrice;

  let disableReason = '';
  if (
    !isUndefined(tokenBalance) &&
    !isUndefined(keyPrice) &&
    tokenBalance < keyPrice
  ) {
    disableReason = `Not enough balance: requires ${price} ${symbol}`;
  }
  if (
    !isUndefined(allowance) &&
    !isUndefined(keyPrice) &&
    allowance < keyPrice
  ) {
    disableReason = 'Not enough allowance';
  }

  return {
    claimFn: purchaseHat,
    disableClaim,
    disableReason,
  };
};

interface UseSubscriptionClaimProps {
  moduleParameters: ModuleParameter[] | undefined;
  moduleDetails: Module | undefined;
  chainId: number | undefined;
  controllerAddress: string | undefined;
  status: string;
  setStatus: (status: string) => void;
}
