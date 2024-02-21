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
import { orderedChains } from '@hatsprotocol/constants';
import blockies from 'blockies-ts';
import { format } from 'date-fns';
import {
  useControllerList,
  useHatsAdminOf,
  useWearerDetails,
} from 'hats-hooks';
import { AppHat, SupportedChains } from 'hats-types';
import { useImageURIs, useToast } from 'hooks';
import _ from 'lodash';
import { GetServerSidePropsContext } from 'next';
import { NextSeo } from 'next-seo';
import { useEffect, useState } from 'react';
import { FiCopy } from 'react-icons/fi';
import { Layout, WearerHatCard as CoreHat } from 'ui';
import { chainsMap, formatAddress, viemPublicClient } from 'utils';
import { Hex } from 'viem';
import { useEnsAvatar, useEnsName } from 'wagmi';

type HeadlineStat = {
  label: string;
  value: number;
  loading: boolean;
};

// TODO use new tree list cards on mobile
// could also consider using tabs for the networks on mobile to reduce the scroll end-to-end

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
  const localOrderedChains = _.filter(orderedChains, (k: number) =>
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

      <Stack align='center' spacing={6} p={{ base: 5, md: 20 }}>
        <Flex
          mt={{ base: 20, md: 10 }}
          w='100%'
          direction={{ base: 'column', md: 'row' }}
          justify='space-between'
          gap={10}
        >
          <HStack spacing={6}>
            <Avatar src={ensAvatar || blockie} h='100px' w='100px' />
            <Stack>
              <HStack>
                <Heading size='lg' variant='medium'>
                  {name}
                </Heading>
                <IconButton
                  variant='ghost'
                  icon={<FiCopy />}
                  size='sm'
                  onClick={() => {
                    onCopy();
                    toast.info({
                      title: 'Successfully copied wearer address to clipboard',
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
          <HStack wrap='wrap' justify='center'>
            {_.map(headlineStats, (stat: HeadlineStat) => (
              <Card w={{ base: '45%', md: '135px' }} key={stat.label}>
                <CardBody>
                  <Stack align='center'>
                    <Text size='sm'>{stat.label}</Text>
                    <Skeleton isLoaded={stat.loading}>
                      <Heading size='2xl'>{stat.value}</Heading>
                    </Skeleton>
                  </Stack>
                </CardBody>
              </Card>
            ))}
          </HStack>
        </Flex>

        <Stack width='100%' justify='left' padding={6} spacing={4}>
          <Stack>
            <Heading size='lg' variant='medium'>
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
              {_.map(localOrderedChains, (chainId: SupportedChains) => (
                <Stack mt={4} spacing={4} key={chainId}>
                  <Heading size='sm'>{chainsMap(Number(chainId)).name}</Heading>

                  <SimpleGrid
                    columns={{ base: 1, md: 4 }}
                    gap={5}
                    key={chainId}
                  >
                    {_.map(
                      _.filter(currentHatsWithImagesData, {
                        chainId: Number(chainId),
                      }),
                      (hat: AppHat) => (
                        <CoreHat
                          hat={hat}
                          key={`${chainId}-${hat.id}`}
                          chainId={chainId}
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
      </Stack>
    </Layout>
  );
};

export const getStaticProps = async (context: GetServerSidePropsContext) => {
  const wearerParam = _.get(context, 'params.wearer');
  const wearer = _.isArray(wearerParam) ? _.first(wearerParam) : wearerParam;

  const publicClient = viemPublicClient(1);

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
