'use client';

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
import { useQueryClient } from '@tanstack/react-query';
import { useEligibility, useOverlay } from 'contexts';
import { NumberInput } from 'forms';
import { useMediaStyles, useTokenDetails } from 'hooks';
import { get, isUndefined, pick, toLower, toUpper } from 'lodash';
import { useLockFromHat } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { BsArrowUpRightCircle } from 'react-icons/bs';
import { getDuration, tokenImageHandler } from 'utils';
import { erc20Abi, formatUnits, maxUint256 } from 'viem';
import { useAccount, useChainId, useWriteContract } from 'wagmi';

const TransactionButton = dynamic(() =>
  import('molecules').then((mod) => mod.TransactionButton),
);
const NetworkSwitcher = dynamic(() =>
  import('molecules').then((mod) => mod.NetworkSwitcher),
);

export const AllowanceActions = ({
  moduleParameters,
  activeSubscription,
}: {
  moduleParameters: ModuleParameter[];
  activeSubscription: boolean;
}) => {
  const { chainId, setIsEligible: setIsReadyToClaim } = useEligibility();
  const currentChainId = useChainId();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const queryClient = useQueryClient();
  const { setModals } = useOverlay();
  const localForm = useForm({});
  const { watch, reset } = pick(localForm, ['watch', 'reset']);
  const { isMobile } = useMediaStyles();

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

                <Text fontFamily='jbMono'>{price || '0'}</Text>
                <Text fontFamily='jbMono' color='gray.500'>
                  {symbol}
                </Text>
              </HStack>
            </Skeleton>
          </Stack>
        </Flex>

        <Flex align='center'>
          {currentChainId === chainId ? (
            <TransactionButton
              sendTx={async () => {
                // @ts-expect-error argument of type
                return writeContractAsync(approvalParams);
              }}
              afterSuccess={() => {
                // refetchAllowance()
                setIsReadyToClaim(true);
                setModals?.({});
                queryClient.invalidateQueries({ queryKey: ['readContracts'] });
              }}
              variant='primary'
              isDisabled={
                (!isUndefined(allowance) &&
                  !isUndefined(amountToApprove) &&
                  allowance >= amountToApprove) ||
                !address
              }
              txDescription='Approve allowance on Hat subscription'
              chainId={chainId}
            >
              Approve {amount || 0} {durationText.noun}
              {amount > 1 || amount === 0 ? 's' : ''} ({tokenAmountText}{' '}
              {symbol})
            </TransactionButton>
          ) : (
            <NetworkSwitcher chainId={chainId} />
          )}
        </Flex>
      </Flex>

      <Flex
        h='75px'
        direction={{ base: 'column-reverse', md: 'row' }}
        justify={!isMobile && hasAllowance ? 'space-between' : 'center'}
        align='center'
        gap={6}
      >
        {hasAllowance && (
          <TransactionButton
            sendTx={async () => {
              // @ts-expect-error argument of type
              return writeContractAsync(zeroApprovalParams);
            }}
            afterSuccess={() => {
              setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ['readContracts'] });
                queryClient.invalidateQueries({ queryKey: ['readContract'] });
              }, 1000);
            }}
            variant='link'
            color='red.500'
            leftIcon={<Icon as={BsArrowUpRightCircle} />}
            txDescription='Cancel subscription for Hat'
            chainId={chainId}
          >
            Cancel Subscription
          </TransactionButton>
        )}

        <TransactionButton
          sendTx={async () => {
            // @ts-expect-error argument of type
            return writeContractAsync(unlimitedApprovalParams);
          }}
          afterSuccess={() => {
            setTimeout(() => {
              queryClient.invalidateQueries({ queryKey: ['readContracts'] });
              queryClient.invalidateQueries({ queryKey: ['readContract'] });
            }, 1000);
          }}
          variant='link'
          isDisabled={!isUndefined(allowance) && allowance === maxUint256}
          leftIcon={<Icon as={BsArrowUpRightCircle} />}
          txDescription='Cancel subscription for Hat'
          chainId={chainId}
        >
          Authorize unlimited withdrawals{' '}
        </TransactionButton>
      </Flex>
    </Stack>
  );
};
