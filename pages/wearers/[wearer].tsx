/* eslint-disable no-nested-ternary */
import {
  Avatar,
  Box,
  Card,
  CardBody,
  Divider,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Skeleton,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react';
import blockies from 'blockies-ts';
import { format } from 'date-fns';
import _ from 'lodash';
import { GetServerSidePropsContext } from 'next';
import { NextSeo } from 'next-seo';
import { useEffect, useState } from 'react';
import { useEnsAvatar, useEnsName } from 'wagmi';

import Layout from '@/components/Layout';
import CoreHat from '@/components/WearerHatCard';
import useControllerList from '@/hooks/useControllerList';
import useHatsAdminOf from '@/hooks/useHatsAdminOf';
import useImageURIs from '@/hooks/useImageURIs';
import useWearerDetails from '@/hooks/useWearerDetails';
import { formatAddress } from '@/lib/general';
import { chainsMap, orderedChains } from '@/lib/web3';
import { IHat } from '@/types';

const WearerDetail = ({
  wearerAddress,
}: {
  wearerAddress: `0x${string}`;
  // initialData: IHat[] | undefined;
}) => {
  const [blockie, setBlockie] = useState<string | undefined>();
  const { data: currentHats, isLoading: wearerLoading } = useWearerDetails({
    wearerAddress,
    chainId: 'all',
  });

  const firstCreated = _.minBy(currentHats, 'createdAt');

  const { data: currentHatsWithImagesData, isLoading: imagesLoading } =
    useImageURIs(currentHats);

  const { data: ensName } = useEnsName({ address: wearerAddress, chainId: 1 });
  const { data: ensAvatar } = useEnsAvatar({
    name: ensName,
    chainId: 1,
  });

  const { data: controllerHats } = useControllerList({
    address: wearerAddress,
  });
  const { data: adminOfHats } = useHatsAdminOf({
    hats: currentHats,
  });

  useEffect(() => {
    setBlockie(
      blockies.create({ seed: wearerAddress.toLowerCase() }).toDataURL(),
    );
  }, [wearerAddress]);

  const headlineStats = [
    {
      label: 'Wearer of',
      value: _.size(currentHats),
      loading: !!currentHats,
    },
    {
      label: 'Admin of',
      value: _.size(adminOfHats),
      loading: !!adminOfHats,
    },
    {
      label: 'Eligibility for',
      value: _.size(
        _.filter(controllerHats, ['eligibility', _.toLower(wearerAddress)]),
      ),
      loading: !!controllerHats,
    },
    {
      label: 'Toggle for',
      value: _.size(
        _.filter(controllerHats, ['toggle', _.toLower(wearerAddress)]),
      ),
      loading: !!controllerHats,
    },
  ];

  const groupedHats = _.groupBy(currentHatsWithImagesData, 'chainId');
  const localOrderedChains = _.filter(orderedChains, (k) =>
    _.includes(_.keys(groupedHats), String(k)),
  );

  return (
    <Layout>
      <NextSeo title={`${ensName || formatAddress(wearerAddress)}'s Hats`} />

      <Box
        w='100%'
        h='100%'
        bg='blue'
        position='fixed'
        opacity={0.07}
        zIndex={-1}
      />

      <Stack align='center' spacing={6} p={20} pt={100}>
        <Flex w='100%' justify='space-between'>
          <HStack spacing={6}>
            <Avatar src={ensAvatar || blockie} h='100px' w='100px' />
            <Stack>
              <Heading size='lg' fontWeight='medium'>
                {ensName || formatAddress(wearerAddress)}
              </Heading>
              <Skeleton isLoaded={!wearerLoading}>
                {!!_.get(firstCreated, 'createdAt') && (
                  <Text>
                    Hat wearer since:{' '}
                    {_.get(firstCreated, 'createdAt') &&
                      format(
                        Number(_.get(firstCreated, 'createdAt')) * 1000,
                        'MMMM yyyy',
                      )}
                  </Text>
                )}
              </Skeleton>
            </Stack>
          </HStack>
          <HStack>
            {_.map(headlineStats, (stat) => (
              <Card w='125px' key={stat.label}>
                <CardBody>
                  <Stack align='center'>
                    <Text fontSize='sm'>{stat.label}</Text>
                    <Skeleton isLoaded={stat.loading}>
                      <Heading size='lg'>{stat.value}</Heading>
                    </Skeleton>
                  </Stack>
                </CardBody>
              </Card>
            ))}
          </HStack>
        </Flex>

        <Stack width='100%' justify='left' padding={6} spacing={4}>
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
              {_.map(localOrderedChains, (chainId) => (
                <Stack mt={4} spacing={4}>
                  <Heading size='sm'>{chainsMap(Number(chainId)).name}</Heading>

                  <SimpleGrid columns={4} gap={5} key={chainId}>
                    {_.map(
                      _.filter(currentHatsWithImagesData, {
                        chainId: Number(chainId),
                      }),
                      (hat: IHat) => (
                        <CoreHat hat={hat} key={`${chainId}-${hat.prettyId}`} />
                      ),
                    )}
                  </SimpleGrid>
                  <Divider border='1px solid' borderColor='gray.400' />
                </Stack>
              ))}
            </Stack>
          )}
        </Stack>
      </Stack>
    </Layout>
  );
};

export const getStaticProps = async (context: GetServerSidePropsContext) => {
  const wearerParam = _.get(context, 'params.wearer');
  const wearer = _.isArray(wearerParam) ? _.first(wearerParam) : wearerParam;

  return {
    props: {
      wearerAddress: wearer,
      // initialData: undefined,
    },
    revalidate: 60,
  };
};

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export default WearerDetail;
