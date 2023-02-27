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
import { fetchWearerDetails, fetchAllWearers } from '../../gql/helpers';
import useWearerDetails from '../../hooks/useWearerDetails';
import Layout from '../../components/Layout';
import { formatAddress } from '../../lib/general';
import { prettyIdToIp, prettyIdToUrlId, decimalId } from '../../lib/hats';

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
            <Text as='b'>Hat Name</Text>
            <Text key={_.get(hat, 'id')} fontSize='sm'>
              Hat ID: {prettyIdToIp(_.get(hat, 'prettyId'))}
            </Text>
            <Text fontSize='sm'>Tree: Hats Protocol DAO</Text>
          </Stack>
        </HStack>
        <HStack>
          <Tag size='md' colorScheme='gray' borderRadius='full'>
            <TagLabel>Level 1</TagLabel>
          </Tag>
          <Tag size='md' colorScheme='gray' borderRadius='full'>
            <TagLabel>Active</TagLabel>
          </Tag>
          <Tag size='md' colorScheme='gray' borderRadius='full'>
            <TagLabel>Mutable</TagLabel>
          </Tag>
        </HStack>
      </Stack>
    </CardBody>
  </Card>
);

const WearerDetail = ({ wearerAddress, chainId, initialData }) => {
  const { data: wearer } = useWearerDetails({
    wearerAddress,
    chainId,
    initialData,
  });

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
        </Stack>
      </Stack>
    </Layout>
  );
};

const defaultChainId = 5;
export const getStaticPaths = async () => {
  const result = await fetchAllWearers(defaultChainId);

  const paths = _.map(result, (wearer) => ({
    params: { wearer: wearer.id },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps = async (props) => {
  const { wearer } = props.params;
  const initialData = await fetchWearerDetails(
    _.toLower(wearer),
    defaultChainId,
  );

  return {
    props: {
      wearerAddress: wearer,
      chainId: defaultChainId,
      initialData,
    },
  };
};

export default WearerDetail;
