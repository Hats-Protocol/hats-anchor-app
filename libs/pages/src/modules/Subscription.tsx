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
import { PublicLockV14 } from '@unlock-protocol/contracts';
import { useEligibility } from 'contexts';
import { useMediaStyles } from 'hooks';
import _ from 'lodash';
import { useAgreementEligibility } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { hatLink } from 'utils';
import { erc20Abi } from 'viem';
import { useAccount, useReadContracts } from 'wagmi';

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
  const { address } = useAccount();
  const { isMobile } = useMediaStyles();
  const { instanceParameters, selectedHat, chainId } = useEligibility();
  console.log(instanceParameters);
  // We should be getteing these values from the instance (.selectedHat.elligibility)
  // "0x1981d8e78ba34f5953a997cfa4d0abb9f88789d0"
  const moduleParameters = [
    {
      label: 'Referrer',
      value: '0x018e494352a3E68e16d03ed976Fd64134bd82E72', // FEE_SPLIT_RECIPIENT
    },
    {
      label: 'Lock Contract',
      value: '0xb5552210fA9f572De938F4F0F518F868e6a6e597 ',
    },
  ];

  const lockPropertiesRequests = useReadContracts({
    contracts: [
      {
        address: '0xb5552210fA9f572De938F4F0F518F868e6a6e597',
        abi: PublicLockV14.abi,
        functionName: 'tokenAddress',
        args: [],
      },
      {
        address: '0xb5552210fA9f572De938F4F0F518F868e6a6e597',
        abi: PublicLockV14.abi,
        functionName: 'purchasePriceFor',
        args: [address, '0x018e494352a3E68e16d03ed976Fd64134bd82E72', ''],
      },
      {
        address: '0xb5552210fA9f572De938F4F0F518F868e6a6e597',
        abi: PublicLockV14.abi,
        functionName: 'expirationDuration',
        args: [],
      },
    ],
  });
  console.log(lockPropertiesRequests.isLoading);
  console.log(lockPropertiesRequests.data);

  // Now get the token properties, if applicable.
  const decimals = 18; // get the chain defaults
  const symbol = 'ETH'; // get the chain defaults
  let approval;

  const contractAddress =
    lockPropertiesRequests.data?.[0].status === 'success'
      ? lockPropertiesRequests.data?.[0].result
      : null;

  console.log(contractAddress);

  const tokenPropertiesRequests = useReadContracts({
    contracts: contractAddress
      ? [
          {
            address: contractAddress,
            abi: erc20Abi,
            functionName: 'decimals',
          },
          {
            address: contractAddress,
            abi: erc20Abi,
            functionName: 'symbol',
          },
          {
            address: contractAddress,
            abi: erc20Abi,
            functionName: 'allowance',
            args: [address, '0xb5552210fA9f572De938F4F0F518F868e6a6e597'],
          },
        ]
      : [],
  });

  console.log({ tokenPropertiesRequests });

  // console.log({ moduleParameters, selectedHat, chainId });
  // const { agreement } = useAgreementEligibility({
  //   moduleParameters,
  // });
  // const [isReviewed, setIsReviewed] = useState(false);
  // const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  // const isWearing = useMemo(
  //   () => _.includes(_.map(selectedHat?.wearers, 'id'), _.toLower(address)),
  //   [selectedHat, address],
  // );
  // const hasSupply = useMemo(
  //   () =>
  //     _.toNumber(selectedHat?.maxSupply) -
  //       _.toNumber(selectedHat?.currentSupply) >
  //     0,
  //   [selectedHat],
  // );

  // const handleScroll = (e: any) => {
  //   const bottom =
  //     Math.floor(e.target.scrollHeight - e.target.scrollTop) ===
  //     e.target.clientHeight;
  //   if (bottom) setIsButtonEnabled(true);
  // };

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
                This is a subscription hat. To get it you need to pay XX CC
                every DD days
              </p>
              <Button>Approve CC</Button>
            </CardBody>
          </Card>
        </Flex>
      </Stack>
    </Layout>
  );
};

export default Subscription;
