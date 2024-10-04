'use client';

import {
  Box,
  Card,
  CardBody,
  ComponentWithAs,
  Flex,
  Heading,
  HStack,
  Icon,
  IconProps,
  Skeleton,
  Stack,
  Text,
} from '@chakra-ui/react';
import { PublicLockV14 } from '@unlock-protocol/contracts';
import { useEligibility } from 'contexts';
import { useWearerDetails } from 'hats-hooks';
import { compact, isUndefined, map, some } from 'lodash';
import { useLockFromHat } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { BsCheckSquareFill, BsXOctagonFill } from 'react-icons/bs';
import { MixedIcon } from 'types';
import { getDuration } from 'utils';
import { erc20Abi, formatUnits, Hex } from 'viem';
import { useAccount, useReadContracts } from 'wagmi';

import { AllowanceActions } from './AllowanceActions';

const DevInfo = dynamic(() => import('modules-ui').then((mod) => mod.DevInfo));

const Subscription = () => {
  const { address } = useAccount();
  const { chainId, moduleParameters, selectedHat } = useEligibility();
  const {
    isLoading,
    price,
    decimals,
    keyPrice,
    symbol,
    duration,
    currencyContract,
    lockAddress,
  } = useLockFromHat({
    moduleParameters,
    chainId,
  });

  const { data: wearerDetails, isLoading: isLoadingWearerDetails } =
    useWearerDetails({
      wearerAddress: address as Hex,
      chainId,
    });

  const lockContract = {
    address: lockAddress,
    abi: PublicLockV14.abi,
    chainId,
  } as const;

  const tokenContract = {
    address: currencyContract,
    abi: erc20Abi,
    chainId,
  } as const;

  const contracts = [
    {
      ...lockContract,
      functionName: 'balanceOf',
      args: [address as Hex],
    },
    {
      ...tokenContract,
      functionName: 'allowance',
      args: [address as Hex, lockAddress],
    },
    {
      ...tokenContract,
      functionName: 'balanceOf',
      args: [address as Hex],
    },
  ];

  const { data: contractData, refetch: refetchBalances } = useReadContracts({
    contracts: contracts as any,
  });
  const [keyBalance, allowance, tokenBalance] = map(contractData, 'result') as [
    bigint,
    bigint,
    bigint,
  ];

  const isWearing = some(wearerDetails, { id: selectedHat?.id });
  const hasAllowance = allowance && allowance >= BigInt(0);
  const activeSubscription = keyBalance && keyBalance > BigInt(0);

  const moduleDescriptors = useMemo(() => {
    return compact([
      !isUndefined(allowance) && {
        label: 'Allowance',
        descriptor: `${formatUnits(allowance, Number(decimals))} ${symbol}`,
      },
      !isUndefined(tokenBalance) && {
        label: 'Token Balance',
        descriptor: `${formatUnits(tokenBalance, Number(decimals))} ${symbol}`,
      },
      !isUndefined(keyBalance) && {
        label: 'Key Balance',
        descriptor: `${keyBalance.toString()} keys`,
      },
    ]);
  }, [keyBalance, tokenBalance, allowance, decimals, symbol]);

  if (isLoading || isLoadingWearerDetails) {
    return <Skeleton w='full' h='200px' />;
  }

  if (!moduleParameters) {
    return (
      <Card>
        <CardBody>
          <Heading size='md'>Subscribe</Heading>

          <p>Can't install instance params</p>
        </CardBody>
      </Card>
    );
  }

  const durationText = getDuration(duration);

  let subscriptionStatus = 'No authorization';
  let subscriptionStatusIcon: MixedIcon = BsXOctagonFill;
  if (hasAllowance || activeSubscription) {
    const durationsLeft = keyPrice ? Number(allowance / keyPrice) : 1;
    subscriptionStatus = `${durationsLeft} ${durationText.noun}${
      durationsLeft > 1 ? 's' : ''
    } left`;
    subscriptionStatusIcon = BsCheckSquareFill as ComponentWithAs<
      'svg',
      IconProps
    >;
  }

  return (
    <Stack spacing={8}>
      <Card w='full' mx={{ base: 2, md: 0 }} ml={{ md: 8, lg: 10 }}>
        <CardBody m={{ base: 0, md: 4 }}>
          <Stack spacing={8}>
            <Heading>
              Authorize {durationText.adjective} fee{' '}
              {!activeSubscription ? `of ${price} ${symbol}` : ''} to claim this
              Hat
            </Heading>

            <Stack spacing={1}>
              <Heading size='lg'>
                Requirements to claim and keep this Hat
              </Heading>
              <Flex w='full' justify='space-between'>
                <Text>Pay the subscription fee</Text>

                <HStack>
                  <Text color={hasAllowance ? 'green.500' : 'red.500'}>
                    {subscriptionStatus}
                  </Text>

                  <Icon
                    as={subscriptionStatusIcon}
                    color={hasAllowance ? 'green.500' : 'red.500'}
                  />
                </HStack>
              </Flex>
            </Stack>

            {(!hasAllowance || isWearing) && (
              <Stack>
                <Heading size='lg'>
                  {!isWearing
                    ? 'Authorize Unlock Protocol to withdraw from your wallet'
                    : 'How to pay the subscription fee'}
                </Heading>

                <Text>
                  To enable a {durationText.adjective} withdrawal of the
                  subscription fee, you pre-approved Unlock Protocol to withdraw{' '}
                  {symbol} from the address that you use to claim the role.
                </Text>
                <Text>
                  You can adjust the authorized amount to control the duration
                  of your subscription.
                </Text>
                <Text>
                  If the authorization runs out or the {durationText.adjective}{' '}
                  fee is not covered in your wallet, you will lose your Hat and
                  its privileges.
                </Text>
              </Stack>
            )}
            {hasAllowance && !isWearing && (
              <Stack>
                <Heading size='lg'>Claim your Hat now</Heading>

                <Text>
                  You enabled a monthly withdrawal of the subscription fee and
                  paid the first month.
                </Text>
                <Text>You can now claim this Hat.</Text>
                <Text>
                  Below you can adjust the authorized amount to control the
                  duration of your subscription.
                </Text>
              </Stack>
            )}

            <AllowanceActions
              moduleParameters={moduleParameters}
              activeSubscription={!!activeSubscription}
            />
          </Stack>
        </CardBody>
      </Card>

      <Box maxW='350px' ml={14}>
        <DevInfo moduleDescriptors={moduleDescriptors} />
      </Box>
    </Stack>
  );
};

export default Subscription;
