'use client';

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
import { useEligibility } from 'contexts';
import { useMediaStyles } from 'hooks';
import _ from 'lodash';
import { useAgreementEligibility } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { hatLink } from 'utils';
import { erc20Abi } from 'viem';
import { useAccount, useReadContracts } from 'wagmi';
import { useLockFromHat } from './useLockFromHat';
import { SubscribeActions } from './SubscribeActions';

const HatIcon = dynamic(() => import('icons').then((mod) => mod.HatIcon));

const Layout = dynamic(() =>
  import('molecules').then((mod) => mod.StandaloneLayout),
);
const ChakraNextLink = dynamic(() =>
  import('ui').then((mod) => mod.ChakraNextLink),
);
const ClaimHat = dynamic(() =>
  import('modules-ui').then((mod) => mod.ClaimHat),
);
const AgreementContent = dynamic(() =>
  import('modules-ui').then((mod) => mod.AgreementContent),
);
const BottomMenu = dynamic(() =>
  import('modules-ui').then((mod) => mod.BottomMenu),
);
const Header = dynamic(() => import('modules-ui').then((mod) => mod.Header));
const Conditions = dynamic(() =>
  import('modules-ui').then((mod) => mod.Conditions),
);

const Subscription = () => {
  const { instanceParameters, chainId } = useEligibility();

  const { price, symbol, duration, currencyContract, lockAddress } =
    useLockFromHat({
      instanceParameters,
      chainId,
    });

  return (
    <Layout title='Claims'>
      <Stack pt='80px' alignItems='center' gap={6} mb={6}>
        <Flex maxW='100%' justifyContent='center'>
          <Header />
        </Flex>
        <Flex maxW='100%' justifyContent='center'>
          <Card>
            <CardBody>
              <Heading size='md'>Subscribe</Heading>
              <p>
                This is a subscription hat. To get it you need to pay {price}{' '}
                {symbol} every {duration} days.
              </p>
              <SubscribeActions
                symbol={symbol}
                price={price}
                lockAddress={lockAddress}
                currencyContract={currencyContract}
              />
            </CardBody>
          </Card>
        </Flex>
      </Stack>
    </Layout>
  );
};

export default Subscription;
