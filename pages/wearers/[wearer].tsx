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
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import _ from 'lodash';
import { GetServerSidePropsContext } from 'next';
import { NextSeo } from 'next-seo';
import { useEnsAvatar, useEnsName } from 'wagmi';

import ChakraNextLink from '@/components/ChakraNextLink';
import Layout from '@/components/Layout';
import { fetchWearerDetails } from '@/gql/helpers';
import useControllerList from '@/hooks/useControllerList';
import useHatDetailsField from '@/hooks/useHatDetailsField';
import useHatsAdminOf from '@/hooks/useHatsAdminOf';
import useImageURIs from '@/hooks/useImageURIs';
import useWearerDetails from '@/hooks/useWearerDetails';
import { formatAddress } from '@/lib/general';
import { prettyIdToIp, prettyIdToUrlId } from '@/lib/hats';
import { chainsList } from '@/lib/web3';
import { IHat } from '@/types';

const CoreHat = ({ hat }: { hat: IHat }) => {
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
          bgImage={_.get(hat, 'imageUrl') || '/icon.jpeg'}
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
  initialData: IHat[];
}) => {
  const { data: currentHats, isLoading: wearerLoading } = useWearerDetails({
    wearerAddress,
    initialData,
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

  const headlineStats = [
    {
      label: 'Wearer of',
      value: _.size(currentHats),
    },
    {
      label: 'Admin of',
      value: _.size(adminOfHats),
    },
    {
      label: 'Eligibility for',
      value: _.size(
        _.filter(controllerHats, ['eligibility', _.toLower(wearerAddress)]),
      ),
    },
    {
      label: 'Toggle for',
      value: _.size(
        _.filter(controllerHats, ['toggle', _.toLower(wearerAddress)]),
      ),
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
                Hat wearer since:{' '}
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
          {wearerLoading || imagesLoading ? (
            <Spinner />
          ) : (
            <SimpleGrid columns={4} gap={5}>
              {_.map(currentHatsWithImagesData, (hat) => (
                <CoreHat
                  hat={hat}
                  key={`${_.get(hat, 'chainId')}-${_.get(hat, 'id')}`}
                />
              ))}
            </SimpleGrid>
          )}
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

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const wearerParam = _.get(context, 'params.wearer');
  const wearer = _.isArray(wearerParam) ? _.first(wearerParam) : wearerParam;

  const promises = _.map(_.keys(chainsList), (chainId) =>
    fetchWearerDetails(_.toLower(wearer), Number(chainId)),
  );

  const result = await Promise.all(promises);

  return {
    props: {
      wearerAddress: wearer,
      initialData: _.flatten(_.map(result, 'currentHats')),
    },
  };
};

export default WearerDetail;
