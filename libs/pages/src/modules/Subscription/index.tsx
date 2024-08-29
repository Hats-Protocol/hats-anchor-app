'use client';

import { Card, CardBody, Flex, Heading, Stack } from '@chakra-ui/react';
import { useEligibility } from 'contexts';
import { useWearerDetails } from 'hats-hooks';
import { includes, map } from 'lodash';
import dynamic from 'next/dynamic';
import { useAccount } from 'wagmi';

import { SubscribeActions } from './SubscribeActions';
import { useLockFromHat } from './useLockFromHat';

const Layout = dynamic(() =>
  import('molecules').then((mod) => mod.StandaloneLayout),
);
const Header = dynamic(() => import('modules-ui').then((mod) => mod.Header));

const Subscription = () => {
  const { address } = useAccount();

  // rest should contain hats deatils including id than I can compare wuth the result from useWearer
  const { chainId, moduleParameters, selectedHat, ...rest } = useEligibility();
  const { keyPrice, price, symbol, duration, currencyContract, lockAddress } =
    useLockFromHat({
      moduleParameters,
      chainId,
    });

  const { data: wearerDetails } = useWearerDetails({
    wearerAddress: address,
    chainId,
  });
  const isWearing = includes(map(wearerDetails, 'id'), selectedHat?.id);

  console.log({ wearerDetails, rest, isWearing });
  /// array of hats
  // maps thru ids and do an find
  return (
    <Layout title='Claims'>
      <Stack pt='80px' alignItems='center' gap={6} mb={6}>
        <Flex maxW='100%' justifyContent='center'>
          <Header />
        </Flex>
        <Flex maxW='100%' justifyContent='center'>
          <Card>
            {moduleParameters && (
              <CardBody>
                <Heading size='md'>Subscribe</Heading>
                <p>
                  This is a subscription hat. To get it you need to pay {price}{' '}
                  {symbol} every {duration} days.
                </p>
                <SubscribeActions
                  keyPrice={keyPrice}
                  symbol={symbol}
                  price={price}
                  lockAddress={lockAddress}
                  currencyContract={currencyContract}
                  chainId={chainId}
                />
              </CardBody>
            )}
            {!moduleParameters && <p>Can't install instance params</p>}
          </Card>
        </Flex>
      </Stack>
    </Layout>
  );
};

export default Subscription;
