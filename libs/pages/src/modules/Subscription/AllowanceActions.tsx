import {
  Box,
  Flex,
  Heading,
  HStack,
  Icon,
  Image,
  Skeleton,
  Stack,
  Text,
} from '@chakra-ui/react';
import { ModuleParameter } from '@hatsprotocol/modules-sdk';
import { useEligibility } from 'contexts';
import { NumberInput } from 'forms';
import { useTokenDetails } from 'hooks';
import { get, isUndefined, pick, toLower, toUpper } from 'lodash';
import { useLockFromHat } from 'modules-hooks';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { BsArrowUpRightCircle } from 'react-icons/bs';
import { getDuration, tokenImageHandler } from 'utils';
import { erc20Abi, formatUnits, maxUint256 } from 'viem';
import { useWriteContract } from 'wagmi';

import { TransactionButton } from './TransactionButton';

export const AllowanceActions = ({
  moduleParameters,
  activeSubscription,
}: {
  moduleParameters: ModuleParameter[];
  activeSubscription: boolean;
}) => {
  const { chainId } = useEligibility();
  const { writeContractAsync } = useWriteContract();
  const localForm = useForm({});
  const { watch, reset } = pick(localForm, ['watch', 'reset']);

  const amount = watch('amount');
  const {
    isLoading,
    keyPrice,
    price,
    symbol,
    decimals,
    currencyContract,
    duration,
    lockAddress,
    allowance,
  } = useLockFromHat({
    moduleParameters,
    chainId,
  });

  // const waitForSubgraph = useWaitForSubgraph()

  const durationText = getDuration(duration);
  const amountToApprove =
    amount && keyPrice ? BigInt(amount) * keyPrice : undefined;
  const tokenAmountText = amountToApprove
    ? formatUnits(amountToApprove, Number(decimals))
    : '';
  const allowanceInDuration =
    allowance && keyPrice ? Number(allowance / keyPrice) : undefined;
  const hasAllowance = allowance && allowance >= BigInt(0);

  const { data: tokenData } = useTokenDetails({
    symbol: toLower(symbol),
  });

  useEffect(() => {
    if (isLoading) return;

    reset({ amount: allowanceInDuration || 1 });
  }, [allowanceInDuration, isLoading, reset]);

  const approvalParams = useMemo(() => {
    return {
      address: currencyContract,
      chainId,
      abi: erc20Abi,
      functionName: 'approve',
      args: [lockAddress, amountToApprove],
    };
  }, [lockAddress, amountToApprove, currencyContract, chainId]);

  const unlimitedApprovalParams = useMemo(() => {
    return {
      address: currencyContract,
      chainId,
      abi: erc20Abi,
      functionName: 'approve',
      args: [lockAddress, maxUint256],
    };
  }, [lockAddress, currencyContract, chainId]);

  const zeroApprovalParams = useMemo(() => {
    return {
      address: currencyContract,
      chainId,
      abi: erc20Abi,
      functionName: 'approve',
      args: [lockAddress, 0],
    };
  }, [lockAddress, currencyContract, chainId]);

  if (!chainId) return null;

  const tokenImage = tokenImageHandler({
    symbol,
    primaryImage: get(tokenData, 'avatar'),
    chainId,
  });

  return (
    <Stack>
      <Skeleton isLoaded={!isLoading}>
        <Heading size='lg'>
          {activeSubscription
            ? 'Your active subscription'
            : 'Authorize Unlock Protocol to withdraw from your wallet'}
        </Heading>
      </Skeleton>

      <Flex
        justify='space-between'
        gap={4}
        align={{ base: 'center', md: 'end' }}
        direction={{ base: 'column', md: 'row' }}
      >
        <Flex
          gap={4}
          justify={{ base: 'space-between', md: 'start' }}
          w={{ base: 'full', md: 'auto' }}
        >
          <Box>
            <NumberInput
              name='amount'
              numOptions={{ min: allowanceInDuration }}
              label='Authorized Duration'
              isDisabled={isLoading}
              localForm={localForm}
            />
          </Box>

          <Stack minW={{ base: 'auto', md: '110px' }} align='center'>
            <Skeleton isLoaded={!isLoading} h='full'>
              <Heading size='sm' fontWeight='medium'>
                {toUpper(`${durationText.adjective} fee`)}
              </Heading>
            </Skeleton>

            <Skeleton isLoaded={!isLoading} my={2}>
              <HStack>
                <Image
                  src={tokenImage}
                  alt={`${symbol} token image`}
                  boxSize={5}
                />

                <Text fontFamily='jbMono'>{price}</Text>
                <Text fontFamily='jbMono' color='gray.500'>
                  {symbol}
                </Text>
              </HStack>
            </Skeleton>
          </Stack>
        </Flex>

        <Flex align='center'>
          <TransactionButton
            onReceipt={() => {
              // refetchAllowance()
            }}
            variant='primary'
            isDisabled={
              !isUndefined(allowance) &&
              !isUndefined(amountToApprove) &&
              allowance >= amountToApprove
            }
            sendTx={async () => {
              // @ts-expect-error argument of type
              return writeContractAsync(approvalParams);
            }}
            txDescription='Approve allowance on Hat subscription'
          >
            Approve {amount} {durationText.noun}
            {amount > 1 ? 's' : ''} ({tokenAmountText} {symbol})
          </TransactionButton>
        </Flex>

        {/*  */}
      </Flex>

      <Flex
        h='75px'
        justify={hasAllowance ? 'space-between' : 'center'}
        align='center'
      >
        {hasAllowance && (
          <TransactionButton
            sendTx={async () => {
              // @ts-expect-error argument of type
              return writeContractAsync(zeroApprovalParams);
            }}
            onReceipt={() => {
              // refetchAllowance()
            }}
            variant='link'
            color='red.500'
            leftIcon={<Icon as={BsArrowUpRightCircle} />}
            txDescription='Cancel subscription for Hat'
          >
            Cancel Subscription
          </TransactionButton>
        )}

        <TransactionButton
          sendTx={async () => {
            // @ts-expect-error argument of type
            return writeContractAsync(unlimitedApprovalParams);
          }}
          onReceipt={() => {
            // refetchAllowance()
          }}
          variant='link'
          isDisabled={!isUndefined(allowance) && allowance === maxUint256}
          leftIcon={<Icon as={BsArrowUpRightCircle} />}
          txDescription='Cancel subscription for Hat'
        >
          Authorize unlimited withdrawals{' '}
        </TransactionButton>
      </Flex>
    </Stack>
  );
};
