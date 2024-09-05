'use client';

import { Card, CardBody, Flex, Heading, Stack } from '@chakra-ui/react';
import { useEligibility } from 'contexts';
import dynamic from 'next/dynamic';

import CheckHasHat from './CheckHasHat';
import { SubscribeActions } from './SubscribeActions';
import { useLockFromHat } from './useLockFromHat';

const Layout = dynamic(() =>
  import('molecules').then((mod) => mod.StandaloneLayout),
);
const Header = dynamic(() => import('modules-ui').then((mod) => mod.Header));

const Subscription = () => {
  const { chainId, moduleParameters, selectedHat } = useEligibility();
  const {
    isLoading,
    keyPrice,
    price,
    symbol,
    duration,
    currencyContract,
    lockAddress,
  } = useLockFromHat({
    moduleParameters,
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
            {isLoading && <p>Loading...</p>}
            {!isLoading && moduleParameters && (
              <CheckHasHat
                selectedHat={selectedHat}
                hasHatChild={
                  <CardBody>
                    <Heading size='md'>You already have this hat</Heading>
                  </CardBody>
                }
                chainId={chainId!}
              >
                <CardBody>
                  <Heading size='md'>Subscribe</Heading>
                  <p>
                    This is a subscription hat. To get it you need to pay{' '}
                    {price} {symbol} every {duration} days.
                  </p>
                  <SubscribeActions
                    keyPrice={keyPrice!}
                    symbol={symbol!}
                    lockAddress={lockAddress!}
                    currencyContract={currencyContract!}
                    chainId={chainId!}
                  />
                </CardBody>
              </CheckHasHat>
            )}
            {!isLoading && !moduleParameters && (
              <p>Can't install instance params</p>
            )}
          </Card>
        </Flex>
      </Stack>
    </Layout>
  );
};

export default Subscription;
