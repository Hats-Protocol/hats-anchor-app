/* eslint-disable no-nested-ternary */
import {
  Avatar,
  Box,
  Button,
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
} from '@chakra-ui/react';
import { orderedChains } from '@hatsprotocol/constants';
import { format } from 'date-fns';
import {
  useControllerList,
  useHatsAdminOf,
  useWearerDetails,
} from 'hats-hooks';
import { useClipboard, useImageURIs, useMediaStyles } from 'hooks';
import _ from 'lodash';
import { GetServerSidePropsContext } from 'next';
import { NextSeo } from 'next-seo';
import { createIcon } from 'opepen-standard';
import { useMemo } from 'react';
import { FiCopy } from 'react-icons/fi';
import { AppHat, SupportedChains } from 'types';
import {
  ChakraNextLink,
  Layout,
  MobileHatCard,
  // OblongAvatar,
  WearerHatCard as CoreHat,
} from 'ui';
import { chainsMap, formatAddress } from 'utils';
import { Hex } from 'viem';
import { useEnsAvatar, useEnsName } from 'wagmi';

type HeadlineStat = {
  label: string;
  value: number;
  loading: boolean;
};

// TODO use new tree list cards on mobile
// TODO switch Avatar back to `OblongAvatar`, something about undefined component/default export mixup
// could also consider using tabs for the networks on mobile to reduce the scroll end-to-end

const WearerDetail = ({
  wearerAddress,
  initialEnsName,
}: {
  wearerAddress: Hex;
  initialEnsName?: string;
  // initialData: Hat[] | undefined;
}) => {
  const { data: currentHats, isLoading: wearerLoading } = useWearerDetails({
    wearerAddress,
    chainId: 'all',
  });
  const { isMobile, isClient } = useMediaStyles();
  const { onCopy } = useClipboard(wearerAddress, {
    toastData: {
      title: 'Successfully copied wearer address to clipboard',
    },
  });

  const firstCreated = _.minBy(currentHats, 'createdAt');

  const { data: currentHatsWithImagesData, isLoading: imagesLoading } =
    useImageURIs({ hats: currentHats });

  const { data: ensName } = useEnsName({
    address: wearerAddress,
    chainId: 1,
  });
  const { data: ensAvatar } = useEnsAvatar({
    name: ensName as string,
    chainId: 1,
  });

  const { data: controllerHats } = useControllerList({
    address: wearerAddress,
  });
  const { data: adminOfHats } = useHatsAdminOf({
    hats: currentHats,
  });

  const name = useMemo(() => {
    return ensName || initialEnsName || formatAddress(wearerAddress);
  }, [ensName, initialEnsName, wearerAddress]);

  const avatar = useMemo(() => {
    if (!wearerAddress || typeof window === 'undefined') return undefined;
    if (ensAvatar) return ensAvatar;
    return createIcon({
      seed: _.toLower(wearerAddress),
      size: 64,
    }).toDataURL();
  }, [wearerAddress, ensAvatar]);

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
    <Layout hideBackLink>
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
          <HStack spacing={6} pl={6}>
            {isClient && (
              <Skeleton isLoaded={!!avatar} h='100px' minW='75px'>
                {avatar && (
                  <Avatar
                    src={avatar}
                    height='100px'
                    w='75px'
                    borderRadius='md'
                  />
                )}
              </Skeleton>
            )}

            <Stack>
              <HStack>
                {isClient && (
                  <Heading size='lg' variant='medium'>
                    {name}
                  </Heading>
                )}

                <IconButton
                  variant='ghost'
                  icon={<FiCopy />}
                  size='sm'
                  onClick={onCopy}
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
              <Card w={{ base: '22%', md: '135px' }} key={stat.label}>
                <CardBody px={{ base: 0, md: 6 }} py={{ base: 2, md: 4 }}>
                  <Stack align='center'>
                    <Text size={{ base: 'xs', md: 'sm' }}>{stat.label}</Text>
                    <Skeleton isLoaded={stat.loading}>
                      <Heading size={{ base: 'md', md: '2xl' }}>
                        {stat.value}
                      </Heading>
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
          {wearerLoading || (!_.isEmpty(currentHats) && imagesLoading) ? (
            <Flex w='100%' justify='center' pt='100px'>
              <Spinner />
            </Flex>
          ) : _.isEmpty(_.keys(localOrderedChains)) ? (
            <Flex w='100%' justify='center' pt='100px'>
              <Stack align='center' gap={10}>
                <Heading size='xl' variant='medium'>
                  Not wearing any hats
                </Heading>
                <HStack>
                  <ChakraNextLink href='/'>
                    <Button variant='outline'>Home</Button>
                  </ChakraNextLink>
                  <ChakraNextLink href='/trees/new'>
                    <Button variant='primary'>Create a new tree</Button>
                  </ChakraNextLink>
                </HStack>
              </Stack>
            </Flex>
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
                      (hat: AppHat) =>
                        isMobile ? (
                          <MobileHatCard
                            hat={hat}
                            key={`${chainId}-${hat.id}`}
                            chainId={chainId}
                          />
                        ) : (
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

  // const publicClient = viemPublicClient(1);

  try {
    // const initialEnsName = await publicClient.getEnsName({
    //   address: wearer as Hex,
    // });

    return {
      props: {
        wearerAddress: wearer,
        initialEnsName: null,
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
