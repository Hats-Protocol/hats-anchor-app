import { CLAIM_STATUS } from '@hatsprotocol/constants';
import { Module, ModuleParameter } from '@hatsprotocol/modules-sdk';
import { useQueryClient } from '@tanstack/react-query';
import { PublicLockV14 } from '@unlock-protocol/contracts';
import { viemPublicClient } from 'utils';
import { Abi, zeroAddress } from 'viem';
import { useAccount, useWriteContract } from 'wagmi';

import { useLockFromHat } from './useLockFromHat';

export const useSubscriptionClaim = ({
  moduleParameters,
  moduleDetails,
  chainId,
  controllerAddress,
  status,
  setStatus,
}: UseSubscriptionClaimProps) => {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const queryClient = useQueryClient();
  const { keyPrice, currencyContract, lockAddress, allowance } = useLockFromHat(
    {
      moduleParameters,
      chainId,
    },
  );

  const lockContract = {
    abi: PublicLockV14.abi as Abi,
    address: lockAddress,
  } as const;

  const purchaseHat = async () => {
    setStatus(CLAIM_STATUS.CLAIMING);
    return writeContractAsync({
      ...lockContract,
      functionName: 'purchase',
      args: [
        [keyPrice], // values
        [address], // recipients
        [address], // [REFERRAL_ADDRESS], // referral
        [address], // keyManagers
        ['0x'], // data (empty)
      ],
      chainId,
      value: currencyContract !== zeroAddress ? 0n : keyPrice,
    } as any)
      .then(async (hash) => {
        console.log({ hash });
        if (!chainId) return;
        const client = viemPublicClient(chainId);
        return client
          .waitForTransactionReceipt({ hash })
          .then(async (receipt) => {
            console.log(receipt);
            // TODO wait for subgraph
            await new Promise((resolve) => setTimeout(resolve, 10000));

            queryClient.invalidateQueries({ queryKey: ['wearerDetails'] });
            queryClient.invalidateQueries({ queryKey: ['hatDetails'] });
            queryClient.invalidateQueries({ queryKey: ['treeDetails'] });
            // refetchBalances();
            setStatus(CLAIM_STATUS.SUCCESS);
          });
      })
      .catch((err) => {
        console.log(err);
        setStatus(CLAIM_STATUS.FAILED);
      });
  };

  const disableClaim =
    !lockAddress || !keyPrice || !currencyContract || allowance < keyPrice;

  return {
    claimFn: purchaseHat,
    disableClaim,
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
