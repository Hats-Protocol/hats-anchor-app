'use client';

import {
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
import { useEligibility } from 'contexts';
import { useWearerDetails } from 'hats-hooks';
import { some } from 'lodash';
import { useLockFromHat } from 'modules-hooks';
import {
  BsCheckSquare,
  BsCheckSquareFill,
  BsXOctagonFill,
} from 'react-icons/bs';
import { MixedIcon } from 'types';
import { getDuration } from 'utils';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

import { AllowanceActions } from './allowance-actions';
import { SubscriptionDevInfo } from './subscription-dev-info';

const MIN_ONE_TIME_DURATION = 9 * 365; // 9 years, duration is in days

export const SubscriptionClaims = () => {
  const { address } = useAccount();
  const { chainId, moduleParameters, selectedHat } = useEligibility();
  const {
    isLoading,
    price,
    keyPrice,
    symbol,
    duration,
    keyBalance,
    allowance,
  } = useLockFromHat({
    moduleParameters,
    chainId,
  });

  const { data: wearerDetails, isLoading: isLoadingWearerDetails } =
    useWearerDetails({
      wearerAddress: address as Hex,
      chainId,
    });

  const isWearing = some(wearerDetails, { id: selectedHat?.id });
  const hasAllowance = allowance && allowance >= BigInt(0);
  const activeSubscription = keyBalance && keyBalance > BigInt(0);

  if (isLoading || isLoadingWearerDetails) {
    return <Skeleton w='full' h='500px' borderRadius='md' />;
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

  const isOneTime = duration && duration >= MIN_ONE_TIME_DURATION;
  const durationText = getDuration(duration);

  let status = 'Not Paid';
  let icon: MixedIcon = BsXOctagonFill;
  let color = 'red.500';
  if (hasAllowance && !activeSubscription) {
    const durationsLeft = keyPrice ? Number(allowance / keyPrice) : 1;
    status = isOneTime
      ? 'Authorized'
      : `Authorized for ${durationsLeft} ${durationText.noun}${
          durationsLeft > 1 || durationsLeft === 0 ? 's' : ''
        }`;
    icon = BsCheckSquare;
    color = 'green.500';
  } else if (activeSubscription) {
    const durationsLeft = keyPrice ? Number(allowance / keyPrice) : 1;
    if (durationsLeft === 0 && !isOneTime) {
      status = 'Renew Soon';
      icon = BsCheckSquare;
      color = 'orange.500';
    } else {
      status = isOneTime
        ? 'Paid'
        : `${durationsLeft} ${durationText.noun}${
            durationsLeft > 1 || durationsLeft === 0 ? 's' : ''
          } left`;
      icon = BsCheckSquareFill as ComponentWithAs<'svg', IconProps>;
      color = 'green.500';
    }
  }

  return (
    <Stack spacing={8}>
      <Card w='full' mx={{ base: 2, md: 0 }}>
        <CardBody m={{ base: 0, md: 4 }}>
          <Stack spacing={8}>
            {isOneTime ? (
              <Heading>Purchase and claim this Hat</Heading>
            ) : (
              <Heading>
                Authorize {durationText.adjective} fee{' '}
                {!activeSubscription ? `of ${price} ${symbol}` : ''} to claim
                this Hat
              </Heading>
            )}

            <Stack spacing={1}>
              <Heading size='lg'>
                Requirements to claim and keep this Hat
              </Heading>
              <Flex w='full' justify='space-between'>
                <Text>
                  Pay the {isOneTime ? 'one-time fee' : 'subscription'}
                </Text>

                <HStack>
                  <Text color={color}>{status}</Text>

                  <Icon as={icon} color={color} />
                </HStack>
              </Flex>
            </Stack>

            {(!hasAllowance || isWearing) && !isOneTime && (
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
            {hasAllowance && !isWearing && !isOneTime && (
              <Stack>
                <Heading size='lg'>Claim your Hat now</Heading>

                <Text>
                  You've enabled a {durationText.adjective} withdrawal of the
                  subscription fee.
                </Text>
                <Text>
                  You can now claim this Hat and pay the first{' '}
                  {durationText.noun}.
                </Text>
                <Text>
                  Anytime you'd like, you can adjust the authorized amount to
                  control the potential duration of your subscription.
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

      <SubscriptionDevInfo
        moduleParameters={moduleParameters}
        chainId={chainId}
      />
    </Stack>
  );
};
