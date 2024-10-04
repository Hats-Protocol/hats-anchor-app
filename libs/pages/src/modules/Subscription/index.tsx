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
import { useQueryClient } from '@tanstack/react-query';
import { PublicLockV14 } from '@unlock-protocol/contracts';
import { useEligibility } from 'contexts';
import { useWearerDetails } from 'hats-hooks';
import { compact, isUndefined, map, pick, some } from 'lodash';
import dynamic from 'next/dynamic';
import { ReactNode, useMemo, useState } from 'react';
import { BsCheckSquareFill, BsXOctagonFill } from 'react-icons/bs';
import { MixedIcon } from 'types';
import {
  formatAddress,
  getDuration,
  // REFERRAL_ADDRESS,
  viemPublicClient,
} from 'utils';
import { Abi, erc20Abi, formatUnits, Hex, zeroAddress } from 'viem';
import { useAccount, useReadContracts, useWriteContract } from 'wagmi';

import { AllowanceActions } from './AllowanceActions';
import { useLockFromHat } from './useLockFromHat';

const Layout = dynamic(() =>
  import('molecules').then((mod) => mod.StandaloneLayout),
);
const Header = dynamic(() => import('modules-ui').then((mod) => mod.Header));
const DevInfo = dynamic(() => import('modules-ui').then((mod) => mod.DevInfo));

const SubscriptionWrapper = ({
  children,
  balanceData,
  refetchBalances,
}: {
  children: ReactNode;
  balanceData: { keyBalance: bigint; tokenBalance: bigint; allowance: bigint };
  refetchBalances: () => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { address } = useAccount();
  const { chainId, selectedHat, moduleParameters } = useEligibility();
  const { writeContractAsync } = useWriteContract();
  const queryClient = useQueryClient();
  const { keyPrice, currencyContract, decimals, lockAddress } = useLockFromHat({
    moduleParameters,
    chainId,
  });
  const { keyBalance, tokenBalance, allowance } = pick(balanceData, [
    'keyBalance',
    'tokenBalance',
    'allowance',
  ]);
  // TODO check if module is wearing admin hat

  const lockContract = {
    abi: PublicLockV14.abi as Abi,
    address: lockAddress,
  } as const;

  const purchaseHat = async () => {
    setIsLoading(true);
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
            refetchBalances();
            setIsLoading(false);
          });
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
  };

  const disableClaim = useMemo(() => {
    return !lockAddress || !keyPrice || !currencyContract;
  }, [lockAddress, keyPrice, currencyContract]);

  const moduleDescriptors = useMemo(() => {
    return compact([
      selectedHat?.eligibility && {
        label: 'Eligibility',
        descriptor: formatAddress(selectedHat.eligibility),
      },
      selectedHat?.toggle && {
        label: 'Toggle',
        descriptor: formatAddress(selectedHat.toggle),
      },
      !isUndefined(allowance) && {
        label: 'Allowance',
        descriptor: formatUnits(allowance, Number(decimals)),
      },
      !isUndefined(tokenBalance) && {
        label: 'Token Balance',
        descriptor: formatUnits(tokenBalance, Number(decimals)),
      },
      !isUndefined(keyBalance) && {
        label: 'Key Balance',
        descriptor: keyBalance.toString(),
      },
    ]);
  }, [keyBalance, tokenBalance, allowance, decimals, selectedHat]);

  return (
    <Layout
      title='Claims'
      claimFn={purchaseHat}
      disableClaim={disableClaim}
      requireHatter={false}
      isLoading={isLoading}
    >
      <Flex pt='100px' justify='space-between' gap='100px' px={10} mb={6}>
        <Flex maxW='65%'>{children}</Flex>

        <Stack maxW='30%' spacing={8}>
          <Box>
            <Header />
          </Box>

          {selectedHat && <DevInfo moduleDescriptors={moduleDescriptors} />}

          {/* 
            <Button variant='outlineMatch' colorScheme='blue.500'>
              View full role
            </Button> 
          */}
        </Stack>
      </Flex>
    </Layout>
  );
};

const Subscription = () => {
  const { address } = useAccount();
  const { chainId, moduleParameters, selectedHat } = useEligibility();
  const {
    isLoading,
    price,
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
  } as const;

  const tokenContract = {
    address: currencyContract,
    abi: erc20Abi,
  } as const;

  const contracts: any = [
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

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore infinitely deep type
  const { data: contractData, refetch: refetchBalances } = useReadContracts({
    contracts,
  });
  const [keyBalance, allowance, tokenBalance] = map(contractData, 'result') as [
    bigint,
    bigint,
    bigint,
  ];
  const balanceData = {
    keyBalance: keyBalance || 0n,
    tokenBalance: tokenBalance || 0n,
    allowance: allowance || 0n,
  };

  const isWearing = some(wearerDetails, { id: selectedHat?.id });
  const hasAllowance = allowance && allowance >= BigInt(0);
  const activeSubscription = keyBalance && keyBalance > BigInt(0);

  if (isLoading || isLoadingWearerDetails) {
    return (
      <SubscriptionWrapper
        balanceData={balanceData}
        refetchBalances={refetchBalances}
      >
        <Skeleton w='full' h='200px' />
      </SubscriptionWrapper>
    );
  }

  if (!moduleParameters) {
    return (
      <SubscriptionWrapper
        balanceData={balanceData}
        refetchBalances={refetchBalances}
      >
        <Card>
          <CardBody>
            <Heading size='md'>Subscribe</Heading>

            <p>Can't install instance params</p>
          </CardBody>
        </Card>
      </SubscriptionWrapper>
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
    <SubscriptionWrapper
      balanceData={balanceData}
      refetchBalances={refetchBalances}
    >
      <Card w='full'>
        <CardBody m={4}>
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
    </SubscriptionWrapper>
  );
};

export default Subscription;
