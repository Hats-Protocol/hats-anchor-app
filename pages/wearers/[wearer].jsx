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
} from '@chakra-ui/react';
import { useEnsName } from 'wagmi';

import { fetchWearerDetails } from '@/gql/helpers';
import useWearerDetails from '@/hooks/useWearerDetails';
import useImageURIs from '@/hooks/useImageURIs';
import { formatAddress } from '@/lib/general';
import { prettyIdToIp, prettyIdToUrlId } from '@/lib/hats';
import { chainsColors, chainsMap } from '@/lib/web3';
import Layout from '@/components/Layout';
import ChakraNextLink from '@/components/ChakraNextLink';
import useHatDetailsField from '@/hooks/useHatDetailsField';
import HeadComponent from '@/components/HeadComponent';
import CONFIG from '@/constants';

const CoreHat = ({ hat, image }) => {
  const { data: hatDetailsFieldData, schemaType: schemaTypeDetailsField } =
    useHatDetailsField(_.get(hat, 'details'));

  const hatName =
    schemaTypeDetailsField === '1.0'
      ? _.get(hatDetailsFieldData, 'name')
      : _.get(hat, 'details');

  return (
    <Card key={_.get(hat, 'id')}>
      <CardBody as={Flex} h='75px'>
        <Stack>
          <HStack
            h='100px'
            w='100%'
            justify='left'
            align='center'
            spacing='16px'
          >
            <Box
              bgImage={image || '/icon.jpeg'}
              bgSize='cover'
              bgPosition='center'
              alt='Top Hat image'
              w='85px'
              h='85px'
              border='1px solid'
              borderColor='gray.200'
            />
            <Stack maxW='60%' spacing={1}>
              <Text as='b' noOfLines={2}>
                {hatName}
              </Text>
              <Text fontSize='sm'>
                Hat ID: {prettyIdToIp(_.get(hat, 'prettyId'))}
              </Text>
              {/* <Text fontSize='sm'>Tree: Hats Protocol DAO</Text> */}
            </Stack>
          </HStack>
          <HStack>
            {_.eq(_.get(hat, 'levelAtLocalTree'), 0) ? (
              <Tag size='md' colorScheme='purple' borderRadius='full'>
                <TagLabel>Top Hat</TagLabel>
              </Tag>
            ) : (
              <Tag size='md' colorScheme='blue' borderRadius='full'>
                <TagLabel>Level {_.get(hat, 'levelAtLocalTree')}</TagLabel>
              </Tag>
            )}

            {_.get(hat, 'status') ? (
              <Tag size='md' colorScheme='green' borderRadius='full'>
                <TagLabel>Active</TagLabel>
              </Tag>
            ) : (
              <Tag size='md' colorScheme='gray' borderRadius='full'>
                <TagLabel>Inactive</TagLabel>
              </Tag>
            )}

            {_.get(hat, 'mutable') ? (
              <Tag size='md' colorScheme='blue' borderRadius='full'>
                <TagLabel>Mutable</TagLabel>
              </Tag>
            ) : (
              <Tag size='md' colorScheme='gray' borderRadius='full'>
                <TagLabel>Immutable</TagLabel>
              </Tag>
            )}
            <Tag
              colorScheme={chainsColors(_.get(hat, 'chainId'))}
              borderRadius='full'
            >
              <TagLabel>{chainsMap(_.get(hat, 'chainId'))?.name}</TagLabel>
            </Tag>
          </HStack>
        </Stack>
      </CardBody>
    </Card>
  );
};

const WearerDetail = ({ wearerAddress, initialData }) => {
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

  const imagesPerChain = {
    1: mainnetImagesData,
    5: goerliImagesData,
    10: optimismImagesData,
    100: gnosisImagesData,
    137: polygonImagesData,
    42161: arbitrumImagesData,
    // 11155111: sepoliaImagesData,
  };

  const { data: ensName } = useEnsName({ address: wearerAddress, chainId: 1 });

  return (
    <Layout>
      <HeadComponent
        title={`${ensName || formatAddress(wearerAddress)}'s Hats`}
        url={`${CONFIG.url}/wearers/${wearerAddress}`}
      />

      <Stack align='center' spacing={6}>
        <Heading size='lg'>
          {ensName || formatAddress(wearerAddress)}&apos;s Hats
        </Heading>
        <Stack
          width='100%'
          justify='left'
          border='1px solid'
          borderColor='gray.200'
          padding={6}
        >
          <Heading size='md'>Hats Worn</Heading>
          <SimpleGrid templateColumns='repeat(auto-fit, 350px)' gap={5}>
            {_.map(currentHats, (hat) => (
              <ChakraNextLink
                href={`/trees/${_.get(hat, 'chainId')}/${prettyIdToUrlId(
                  _.get(hat, 'prettyId'),
                  true,
                )}/${prettyIdToUrlId(_.get(hat, 'prettyId'))}`}
                key={`${_.get(hat, 'chainId')}-${_.get(hat, 'id')}`}
              >
                <CoreHat
                  hat={hat}
                  image={imagesPerChain[hat.chainId][hat.id]}
                />
              </ChakraNextLink>
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

export const getServerSideProps = async (context) => {
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
