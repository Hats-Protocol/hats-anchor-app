/* eslint-disable no-nested-ternary */
import {
  Box,
  Divider,
  Flex,
  Heading,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react';
import { orderedChains } from '@hatsprotocol/constants';
import { useImageURIs } from 'app-hooks';
import { chainsMap, formatAddress } from 'app-utils';
import { useWearerDetails } from 'hats-hooks';
import { AppHat } from 'hats-types';
import _ from 'lodash';
import { idToIp } from 'shared';
import { useAccount, useEnsName } from 'wagmi';

import Layout from '../components/Layout';
import CoreHat from '../components/WearerHatCard';

const Home = () => {
  const { address: wearerAddress } = useAccount();

  const { data: currentHats, isLoading: wearerLoading } = useWearerDetails({
    wearerAddress,
    chainId: 'all',
  });

  const sortedHats = _.sortBy(_.compact(currentHats), (hat: AppHat) => {
    return _.indexOf(orderedChains, hat?.chainId);
  });

  const { data: currentHatsWithImagesData, isLoading: imagesLoading } =
    useImageURIs({
      hats: currentHats,
    });

  const { data: ensName } = useEnsName({ address: wearerAddress, chainId: 1 });
  const groupedHats = _.groupBy(currentHatsWithImagesData, 'chainId');
  const localOrderedChains = _.filter(orderedChains, (k: number) =>
    _.includes(_.keys(groupedHats), String(k)),
  );

  return (
    <Layout>
      <Box
        w='100%'
        h='100%'
        bg='blue'
        position='fixed'
        opacity={0.07}
        zIndex={-1}
      />
      <Stack spacing={10} px={20} py={120}>
        {wearerAddress ? (
          <Flex justifyContent='space-between'>
            <Stack>
              <Text fontSize={24} fontWeight='medium'>
                gm {ensName || formatAddress(wearerAddress)} 👋
              </Text>
              {!_.isEmpty(sortedHats) && (
                <Text fontSize={18}>
                  Here&apos;s what&apos;s happening with your hats
                </Text>
              )}
            </Stack>
          </Flex>
        ) : (
          <Stack>
            <Text fontSize={24} fontWeight='medium'>
              Welcome to Hats Protocol! 🧢
            </Text>
            <Text fontSize={18}>
              Please connect your wallet to get started.
            </Text>
          </Stack>
        )}

        {wearerAddress && currentHatsWithImagesData && (
          <Stack width='100%' justify='left' spacing={4}>
            <Stack>
              <Heading size='lg' fontWeight='medium'>
                Wearer of
              </Heading>
              <Divider borderColor='black' />
            </Stack>
            {wearerLoading || imagesLoading ? (
              <Flex w='100%' justify='center' pt='100px'>
                <Spinner />
              </Flex>
            ) : _.isEmpty(_.keys(localOrderedChains)) ? (
              <Text>Not wearing any hats</Text>
            ) : (
              <Stack>
                {_.map(localOrderedChains, (chainId: number) => (
                  <Stack mt={4} spacing={4} key={chainId}>
                    <Heading size='sm'>
                      {chainsMap(Number(chainId)).name}
                    </Heading>

                    <SimpleGrid columns={4} gap={5} key={chainId}>
                      {_.map(
                        _.filter(currentHatsWithImagesData, {
                          chainId: Number(chainId),
                        }),
                        (hat: AppHat) => (
                          <CoreHat
                            hat={hat}
                            key={`${chainId}-${hat.id}`}
                            link={`/${hat.chainId}/${idToIp(hat.id)}`}
                          />
                        ),
                      )}
                    </SimpleGrid>
                    <Divider border='1px solid' borderColor='gray.400' />
                  </Stack>
                ))}
              </Stack>
            )}
          </Stack>
        )}
      </Stack>
    </Layout>
  );
};

export default Home;
