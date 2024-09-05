import { PublicLockV14 } from '@unlock-protocol/contracts';
import { erc20Abi, maxUint256, zeroAddress } from 'viem';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';

import { TransactionButton } from './TransactionButton';

export const SubscribeActions = ({
  symbol,
  lockAddress,
  currencyContract,
  keyPrice,
  chainId,
}: {
  symbol: string;
  lockAddress: `0x${string}`;
  currencyContract: `0x${string}`;
  keyPrice: bigint;
  chainId: number;
}) => {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const { data: approvedAmount, refetch: refetchAllowance } = useReadContract({
    abi: erc20Abi,
    address: currencyContract,
    functionName: 'allowance',
    args: [address!, lockAddress],
    chainId,
  });

  if (currencyContract !== zeroAddress && approvedAmount! < keyPrice) {
    const approvalParams = {
      address: currencyContract,
      chainId,
      abi: erc20Abi,
      functionName: 'approve',
      args: [
        lockAddress, // spender
        maxUint256, // amount (for now we assume unlimited renewals)
      ],
    };
    return (
      <TransactionButton
        onReceipt={() => refetchAllowance()}
        sendTx={async () => {
          // @ts-expect-error Argument of type
          return writeContractAsync(approvalParams);
        }}
      >
        Approve {symbol}
      </TransactionButton>
    );
  }
  return (
    <TransactionButton
      onReceipt={() => {
        console.log('MINTED! CHECK AGAIN?');
      }}
      sendTx={async () => {
        return writeContractAsync({
          abi: PublicLockV14.abi,
          address: lockAddress,
          functionName: 'purchase',
          args: [
            [keyPrice], // values
            [address], // recipients
            [address], // TODO: (referrer) put a Hats DAO address!
            [address], // keyManagers
            [''], // data (empty)
          ],
          chainId,
          value: currencyContract !== zeroAddress ? 0n : keyPrice,
        });
      }}
    >
      Subscribe
    </TransactionButton>
  );
};
