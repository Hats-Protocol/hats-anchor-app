import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useContractRead,
  useReadContract,
} from 'wagmi';
import { PublicLockV14 } from '@unlock-protocol/contracts';

import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Heading,
  HStack,
  Icon,
  Stack,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react';
import { erc20Abi, maxUint256, zeroAddress } from 'viem';
import { useState } from 'react';
import { TransactionButton } from './TransactionButton';

export const SubscribeActions = ({
  symbol,
  price,
  lockAddress,
  currencyContract,
  keyPrice,
  chainId,
}) => {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const { data: approvedAmount, refetch: refetchAllowance } = useReadContract({
    abi: erc20Abi,
    address: currencyContract,
    functionName: 'allowance',
    args: [address, lockAddress],
    chainId,
  });

  if (currencyContract !== zeroAddress && approvedAmount < keyPrice) {
    return (
      <TransactionButton
        onReceipt={refetchAllowance}
        sendTx={async () => {
          return writeContractAsync({
            abi: erc20Abi,
            address: currencyContract,
            functionName: 'approve',
            args: [
              lockAddress, // spender
              maxUint256, // amount (for now we assume unlimited renewals)
            ],
            chainId,
          });
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
            [''], // data
          ],
          chainId,
          value: currencyContract !== zeroAddress ? 0 : keyPrice,
        });
      }}
    >
      Subscribe
    </TransactionButton>
  );
};
