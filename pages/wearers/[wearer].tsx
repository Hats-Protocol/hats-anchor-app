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
  IconButton,
  SimpleGrid,
  Skeleton,
  Spinner,
  Stack,
  Text,
  useClipboard,
} from '@chakra-ui/react';
import blockies from 'blockies-ts';
import { format } from 'date-fns';
import _ from 'lodash';
import { GetServerSidePropsContext } from 'next';
import { NextSeo } from 'next-seo';
import { useEffect, useState } from 'react';
import { FiCopy } from 'react-icons/fi';
import { createPublicClient, Hex, http } from 'viem';
import { useEnsAvatar, useEnsName } from 'wagmi';

import Layout from '@/components/Layout';
import CoreHat from '@/components/WearerHatCard';
import useControllerList from '@/hooks/useControllerList';
import useHatsAdminOf from '@/hooks/useHatsAdminOf';
import useImageURIs from '@/hooks/useImageURIs';
import useToast from '@/hooks/useToast';
import useWearerDetails from '@/hooks/useWearerDetails';
import { chainsMap, orderedChains } from '@/lib/chains';
import { formatAddress } from '@/lib/general';
import { Hat } from '@/types';

const WearerDetail = ({
  wearerAddress,
  initialEnsName,
}: {
  wearerAddress: Hex;
  initialEnsName?: string;
  // initialData: Hat[] | undefined;
}) => {
  const [blockie, setBlockie] = useState<string | undefined>();
  const [name, setName] = useState<string | undefined>(initialEnsName);
  const { data: currentHats, isLoading: wearerLoading } = useWearerDetails({
    wearerAddress,
    chainId: 'all',
  });

  const toast = useToast();
  const { onCopy } = useClipboard(wearerAddress);

  const firstCreated = _.minBy(currentHats, 'createdAt');

  const { data: currentHatsWithImagesData, isLoading: imagesLoading } =
    useImageURIs({ hats: currentHats });

  const { data: ensName } = useEnsName({
    address: wearerAddress,
    chainId: 1,
  });
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
    setName(ensName || formatAddress(wearerAddress));
    setBlockie(
      blockies.create({ seed: wearerAddress.toLowerCase() }).toDataURL(),
    );
  }, [ensName, wearerAddress]);

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
      <NextSeo title={`${name || formatAddress(wearerAddress)}'s Hats`} />

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
              <HStack>
                <Heading size='lg' fontWeight='medium'>
                  {name}
                </Heading>
                <IconButton
                  variant='ghost'
                  icon={<FiCopy />}
                  size='sm'
                  onClick={() => {
                    onCopy();
                    toast.info({
                      title: 'Successfully copied Address to clipboard',
                    });
                  }}
                  aria-label='Copy Address'
                  color='gray.500'
                />
              </HStack>
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
                <Stack mt={4} spacing={4} key={chainId}>
                  <Heading size='sm'>{chainsMap(Number(chainId)).name}</Heading>

                  <SimpleGrid columns={4} gap={5} key={chainId}>
                    {_.map(
                      _.filter(currentHatsWithImagesData, {
                        chainId: Number(chainId),
                      }),
                      (hat: Hat) => (
                        <CoreHat hat={hat} key={`${chainId}-${hat.id}`} />
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

  const publicClient = createPublicClient({
    chain: chainsMap(1),
    transport: http(),
  });

  try {
    const initialEnsName = await publicClient.getEnsName({
      address: wearer as Hex,
    });

    return {
      props: {
        wearerAddress: wearer,
        initialEnsName: initialEnsName || null,
        // initialData:  || undefined,
      },
      revalidate: 60,
    };
  } catch (e) {
    return {
      props: {
        wearerAddress: wearer,
        initialEnsName: null,
        // initialData:  || undefined,
      },
      revalidate: 60,
    };
  }
};

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export default WearerDetail;
