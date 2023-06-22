import React from 'react';
import _ from 'lodash';
import {
  Stack,
  HStack,
  Heading,
  SimpleGrid,
  Text,
  Card,
  CardBody,
  Flex,
  Box,
  Tag,
  TagLabel,
  Avatar,
  Divider,
} from '@chakra-ui/react';
import { useEnsAvatar, useEnsName } from 'wagmi';
import { NextSeo } from 'next-seo';

import { fetchWearerDetails } from '@/gql/helpers';
import useWearerDetails from '@/hooks/useWearerDetails';
import useImageURIs from '@/hooks/useImageURIs';
import { formatAddress } from '@/lib/general';
import { prettyIdToIp, prettyIdToUrlId } from '@/lib/hats';
import { chainsColors, chainsMap } from '@/lib/web3';
import Layout from '@/components/Layout';
import ChakraNextLink from '@/components/ChakraNextLink';
import useHatDetailsField from '@/hooks/useHatDetailsField';
import { IHat } from '@/types';
import { format } from 'date-fns';

const CoreHat = ({ hat, image }: { hat: IHat; image: string }) => {
  const { data: hatDetailsFieldData, schemaType: schemaTypeDetailsField } =
    useHatDetailsField(_.get(hat, 'details'));

  const hatName =
    schemaTypeDetailsField === '1.0'
      ? _.get(hatDetailsFieldData, 'name')
      : _.get(hat, 'details');

  return (
    <ChakraNextLink
      href={`/trees/${_.get(hat, 'chainId')}/${prettyIdToUrlId(
        _.get(hat, 'prettyId'),
        true,
      )}`}
    >
      <Card
        key={_.get(hat, 'id')}
        overflow='hidden'
        border='2px solid'
        borderColor='gray.600'
      >
        <Box
          bgImage={image || '/icon.jpeg'}
          bgSize='cover'
          bgPosition='center'
          w='110%'
          ml={-3}
          mt={-1}
          h='250px'
          border='1px solid'
          borderColor='gray.200'
        />
        <Box
          borderY='1px solid'
          borderColor='gray.600'
          p={2}
          mt={-1}
          bg='white'
        >
          <Text fontSize='xs'>{prettyIdToIp(_.get(hat, 'prettyId'))}</Text>
          <Text as='b' noOfLines={1}>
            {hatName}
          </Text>
        </Box>
        {/* <Box p={2}>Cabin DAO</Box> */}
      </Card>
    </ChakraNextLink>
  );
};

const WearerDetail = ({
  wearerAddress,
  initialData,
}: {
  wearerAddress: `0x${string}`;
  initialData: any;
}) => {
  const { data: mainnetWearer } = useWearerDetails({
    wearerAddress,
    chainId: 1,
    initialData: initialData[1],
  });
  const { data: goerliWearer } = useWearerDetails({
    wearerAddress,
    chainId: 5,
    initialData: initialData[5],
  });
  const { data: optimismWearer } = useWearerDetails({
    wearerAddress,
    chainId: 10,
    initialData: initialData[10],
  });
  const { data: gnosisWearer } = useWearerDetails({
    wearerAddress,
    chainId: 100,
    initialData: initialData[100],
  });
  const { data: polygonWearer } = useWearerDetails({
    wearerAddress,
    chainId: 137,
    initialData: initialData[137],
  });
  const { data: arbitrumWearer } = useWearerDetails({
    wearerAddress,
    chainId: 42161,
    initialData: initialData[42161],
  });
  // const { data: sepoliaWearer } = useWearerDetails({
  //   wearerAddress,
  //   chainId: 11155111,
  //   initialData: initialData[11155111],
  // });

  const mainnetHats = _.get(mainnetWearer, 'currentHats', []);
  const goerliHats = _.get(goerliWearer, 'currentHats', []);
  const optimismHats = _.get(optimismWearer, 'currentHats', []);
  const gnosisHats = _.get(gnosisWearer, 'currentHats', []);
  const polygonHats = _.get(polygonWearer, 'currentHats', []);
  const arbitrumHats = _.get(arbitrumWearer, 'currentHats', []);
  // const sepoliaHats = _.get(sepoliaWearer, 'currentHats', []);

  const currentHats = _.concat(
    mainnetHats,
    arbitrumHats,
    optimismHats,
    gnosisHats,
    polygonHats,
    goerliHats,
    // sepoliaHats,
  );

  const firstCreated = _.minBy(currentHats, 'createdAt');

  const { data: mainnetImagesData } = useImageURIs(_.map(mainnetHats, 'id'), 1);
  const { data: goerliImagesData } = useImageURIs(_.map(goerliHats, 'id'), 5);
  const { data: optimismImagesData } = useImageURIs(
    _.map(optimismHats, 'id'),
    10,
  );
  const { data: gnosisImagesData } = useImageURIs(_.map(gnosisHats, 'id'), 100);
  const { data: polygonImagesData } = useImageURIs(
    _.map(polygonHats, 'id'),
    137,
  );
  const { data: arbitrumImagesData } = useImageURIs(
    _.map(arbitrumHats, 'id'),
    42161,
  );
  // const { data: sepoliaImagesData } = useImageURIs(
  //   _.map(sepoliaHats, 'id'),
  //   11155111,
  // );

  const imagesPerChain: { [key: number]: any } = {
    1: mainnetImagesData,
    5: goerliImagesData,
    10: optimismImagesData,
    100: gnosisImagesData,
    137: polygonImagesData,
    42161: arbitrumImagesData,
    // 11155111: sepoliaImagesData,
  };

  const { data: ensName } = useEnsName({ address: wearerAddress, chainId: 1 });
  const { data: ensAvatar } = useEnsAvatar({
    name: ensName,
    chainId: 1,
  });

  const headlineStats = [
    {
      label: 'Wearer of',
      value: _.size(currentHats),
    },
    {
      label: 'Admin of',
      value: 1,
    },
    {
      label: 'Eligibility for',
      value: 1,
    },
    {
      label: 'Toggle for',
      value: 1,
    },
  ];

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
            <Avatar src={ensAvatar || undefined} h='100px' w='100px' />
            <Stack>
              <Heading size='lg' fontWeight={500}>
                {ensName || formatAddress(wearerAddress)}
              </Heading>
              <Text>
                Hat Wearer since:{' '}
                {format(
                  Number(_.get(firstCreated, 'createdAt')) * 1000,
                  'MMMM yyyy',
                )}
              </Text>
            </Stack>
          </HStack>
          <HStack>
            {_.map(headlineStats, (stat) => (
              <Card w='125px' key={stat.label}>
                <CardBody>
                  <Stack align='center'>
                    <Text fontSize='sm'>{stat.label}</Text>
                    <Heading size='lg'>{stat.value}</Heading>
                  </Stack>
                </CardBody>
              </Card>
            ))}
          </HStack>
        </Flex>

        <Stack width='100%' justify='left' padding={6} spacing={4}>
          <Stack>
            <Heading size='lg' fontWeight={500}>
              Wearer of
            </Heading>
            <Divider borderColor='black' />
          </Stack>
          <SimpleGrid columns={4} gap={5}>
            {_.map(currentHats, (hat) => (
              <CoreHat
                hat={hat}
                image={imagesPerChain[hat.chainId][hat.id]}
                key={`${_.get(hat, 'chainId')}-${_.get(hat, 'id')}`}
              />
            ))}
          </SimpleGrid>
        </Stack>
        {/* <Stack
          width='100%'
          justify='left'
          border='1px solid'
          borderColor='gray.200'
          padding={6}
        >
          <Heading size='md'>Admin Authorities</Heading>
          <SimpleGrid templateColumns='repeat(auto-fit, 350px)' gap={5}>
            {_.map(wearerHats, (hat) => {
              if (!_.eq(_.toNumber(_.get(hat, 'levelAtLocalTree')), 0)) {
                return (
                  <CoreHat
                    hat={hat}
                    image={imagesData[hat.id]}
                    key={_.get(hat, 'id')}
                  />
                );
              }

              return (
                <ChakraLink
                  as={Link}
                  href={`/trees/5/${decimalId(
                    _.get(hat, 'prettyId'),
                  )}/${prettyIdToUrlId(_.get(hat, 'prettyId'))}`}
                  key={_.get(hat, 'id')}
                >
                  <CoreHat hat={hat} image={imagesData[hat.id]} />
                </ChakraLink>
              );
            })}
          </SimpleGrid>
        </Stack>
        <Stack
          width='100%'
          justify='left'
          border='1px solid'
          borderColor='gray.200'
          padding={6}
        >
          <Heading size='md'>Eligibility / Toggle Authorities</Heading>
          <SimpleGrid templateColumns='repeat(auto-fit, 350px)' gap={5}>
            {_.map(wearerHats, (hat) => {
              if (!_.eq(_.toNumber(_.get(hat, 'levelAtLocalTree')), 0)) {
                return (
                  <CoreHat
                    hat={hat}
                    image={imagesData[hat.id]}
                    key={_.get(hat, 'id')}
                  />
                );
              }

              return (
                <ChakraLink
                  as={Link}
                  href={`/trees/5/${decimalId(
                    _.get(hat, 'prettyId'),
                  )}/${prettyIdToUrlId(_.get(hat, 'prettyId'))}`}
                  key={_.get(hat, 'id')}
                >
                  <CoreHat hat={hat} image={imagesData[hat.id]} />
                </ChakraLink>
              );
            })}
          </SimpleGrid>
        </Stack> */}
      </Stack>
    </Layout>
  );
};

export const getServerSideProps = async (context: any) => {
  const { wearer } = context.params;
  const result = await Promise.all([
    fetchWearerDetails(_.toLower(wearer), 1),
    fetchWearerDetails(_.toLower(wearer), 5),
    fetchWearerDetails(_.toLower(wearer), 10),
    fetchWearerDetails(_.toLower(wearer), 100),
    fetchWearerDetails(_.toLower(wearer), 137),
    fetchWearerDetails(_.toLower(wearer), 42161),
    // fetchWearerDetails(_.toLower(wearer), 1115111),
  ]);
  // const initialData = await fetchAllWearerDetails(_.toLower(wearer));

  return {
    props: {
      wearerAddress: wearer,
      initialData: {
        1: result[0] || null,
        5: result[1] || null,
        10: result[2] || null,
        100: result[3] || null,
        137: result[4] || null,
        42161: result[5] || null,
        // 1115111: result[6] || null,
      },
    },
  };
};

export default WearerDetail;
