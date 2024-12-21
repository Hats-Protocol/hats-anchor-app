import { CLAIM_STATUS } from '@hatsprotocol/constants';
import { Module, ModuleParameter } from '@hatsprotocol/modules-sdk';
import { useQueryClient } from '@tanstack/react-query';
import { PublicLockV14 } from '@unlock-protocol/contracts';
import { useToast, useWaitForSubgraph } from 'hooks';
import { isUndefined } from 'lodash';
import { HandlePendingTx } from 'types';
import { REFERRAL_ADDRESS } from 'utils';
import { Abi, Hex, zeroAddress } from 'viem';
import { useAccount, useWriteContract } from 'wagmi';

import { useLockFromHat } from './useLockFromHat';

// TODO replace where we get the ABI from
// TODO check that eligibility module is wearing admin hat (handles its own claiming)

export const useSubscriptionClaim = ({
  moduleParameters,
  chainId,
  setStatus,
  handlePendingTx,
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
    address: lockAddress as Hex,
  } as const;

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['wearerDetails'] });
    queryClient.invalidateQueries({ queryKey: ['hatDetails'] });
    queryClient.invalidateQueries({ queryKey: ['treeDetails'] });
    queryClient.invalidateQueries({ queryKey: ['readContracts'] });
    queryClient.invalidateQueries({ queryKey: ['readContract'] });
    queryClient.invalidateQueries({ queryKey: ['wearerEligibility'] });

    setStatus(CLAIM_STATUS.SUCCESS);
  };

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
    })
      .then(async (hash) => {
        if (!chainId) return;

        toast.info({
          title: 'Transaction pending',
          description: 'Waiting for the transaction to be accepted',
        });

        handlePendingTx?.({
          hash,
          txChainId: chainId,
          txDescription: 'Claiming with subscription',
          waitForSubgraph,
          onSuccess,
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
    hasAllowance:
      !isUndefined(allowance) &&
      !isUndefined(keyPrice) &&
      allowance >= keyPrice,
  };
};

interface UseSubscriptionClaimProps {
  moduleParameters: ModuleParameter[] | undefined;
  moduleDetails: Module | undefined;
  chainId: number | undefined;
  setStatus: (status: string) => void;
  handlePendingTx: HandlePendingTx | undefined;
}
