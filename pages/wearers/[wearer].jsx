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
  Image,
  Tag,
  TagLabel,
  Link as ChakraLink,
} from '@chakra-ui/react';
import Link from 'next/link';
import { fetchAllWearerDetails } from '../../gql/helpers';
import useWearerDetails from '../../hooks/useWearerDetails';
import Layout from '../../components/Layout';
import { formatAddress } from '../../lib/general';
import { prettyIdToIp, prettyIdToUrlId } from '../../lib/hats';
import { chainsColors, chainsMap } from '../../lib/web3';

const CoreHat = ({ hat }) => (
  <Card key={_.get(hat, 'id')}>
    <CardBody as={Flex} h='75px'>
      <Stack>
        <HStack h='100px' w='100%' justify='left' align='center' spacing='16px'>
          <Image
            src='/icon.jpeg'
            alt='Top Hat image'
            maxW='84px'
            border='1px solid'
            borderColor='gray.200'
          />
          <Stack>
            <Text as='b'>{_.get(hat, 'details')}</Text>
            <Text fontSize='sm'>
              Hat ID: {prettyIdToIp(_.get(hat, 'prettyId'))}
            </Text>
            <Text fontSize='sm'>Tree: Hats Protocol DAO</Text>
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

          {_.get(hat, 'isMutable') ? (
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

const WearerDetail = ({ wearerAddress, initialData }) => {
  const { data: wearer } = useWearerDetails({
    wearerAddress,
    initialData,
  });
  const currentHats = _.concat(
    _.get(wearer, 'goerli.currentHats', []),
    _.get(wearer, 'gnosis.currentHats', []),
    _.get(wearer, 'polygon.currentHats', []),
  );

  return (
    <Layout>
      <Stack align='center' spacing={6}>
        <Heading size='lg'>{formatAddress(wearerAddress)} Hats</Heading>
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
              <ChakraLink
                as={Link}
                href={`/trees/${_.get(hat, 'chainId')}/${prettyIdToUrlId(
                  _.get(hat, 'prettyId'),
                  true,
                )}/${prettyIdToUrlId(_.get(hat, 'prettyId'))}`}
                key={_.get(hat, 'id')}
              >
                <CoreHat hat={hat} />
              </ChakraLink>
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
            {_.map(_.get(wearer, 'currentHats'), (hat) => {
              if (!_.eq(_.toNumber(_.get(hat, 'levelAtLocalTree')), 0)) {
                return <CoreHat hat={hat} key={_.get(hat, 'id')} />;
              }

              return (
                <ChakraLink
                  as={Link}
                  href={`/trees/5/${decimalId(
                    _.get(hat, 'prettyId'),
                  )}/${prettyIdToUrlId(_.get(hat, 'prettyId'))}`}
                  key={_.get(hat, 'id')}
                >
                  <CoreHat hat={hat} />
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
            {_.map(_.get(wearer, 'currentHats'), (hat) => {
              if (!_.eq(_.toNumber(_.get(hat, 'levelAtLocalTree')), 0)) {
                return <CoreHat hat={hat} key={_.get(hat, 'id')} />;
              }

              return (
                <ChakraLink
                  as={Link}
                  href={`/trees/5/${decimalId(
                    _.get(hat, 'prettyId'),
                  )}/${prettyIdToUrlId(_.get(hat, 'prettyId'))}`}
                  key={_.get(hat, 'id')}
                >
                  <CoreHat hat={hat} />
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
  const initialData = await fetchAllWearerDetails(_.toLower(wearer));

  return {
    props: {
      wearerAddress: wearer,
      initialData,
    },
  };
};

export default WearerDetail;
