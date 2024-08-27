import { useWriteContract } from 'wagmi';
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
import { zeroAddress } from 'viem';

export const SubscribeActions = ({
  symbol,
  price,
  lockAddress,
  currencyContract,
}) => {
  const { writeContract } = useWriteContract();

  console.log({
    symbol,
    price,
    lockAddress,
    currencyContract,
  });
  if (currencyContract !== zeroAddress) {
    return <Button>Approve {symbol}</Button>;
  }
  return (
    <Button
      onClick={() => {
        console.log('Subscribe!');
        try {
          writeContract({
            abi: PublicLockV14.abi,
            address: lockAddress,
            functionName: 'purchaseFor',
            args: [
              '0xd2135CfB216b74109775236E36d4b433F1DF507B',
              '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
              123n,
            ],
          });
        } catch (err) {
          console.error(err);
        }
      }}
    >
      Subscribe
    </Button>
  );
};
