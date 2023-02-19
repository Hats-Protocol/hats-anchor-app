import React from 'react';
import _ from 'lodash';
import {
  Stack,
  Heading,
  SimpleGrid,
  Text,
  Card,
  CardBody,
  Flex,
  Link as ChakraLink,
} from '@chakra-ui/react';
import Link from 'next/link';
import { fetchWearerDetails } from '../../gql/helpers';
import useWearerDetails from '../../hooks/useWearerDetails';
import Layout from '../../components/Layout';
import { formatAddress } from '../../lib/general';

const CoreHat = ({ hat }) => (
  <Card key={_.get(hat, 'id')}>
    <CardBody as={Flex} h='75px'>
      <Text key={_.get(hat, 'id')}>{_.get(hat, 'prettyId')}</Text>
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
        <Heading size='lg'>{formatAddress(wearerAddress)}</Heading>
        <SimpleGrid columns={6} gap={4}>
          {_.map(_.get(wearer, 'currentHats'), (hat) => {
            if (!_.eq(_.toNumber(_.get(hat, 'levelAtLocalTree')), 0)) {
              return <CoreHat hat={hat} />;
            }

            return (
              <ChakraLink as={Link} href={`/trees/${_.get(hat, 'prettyId')}`}>
                <CoreHat hat={hat} />
              </ChakraLink>
            );
          })}
        </SimpleGrid>
      </Stack>
    </Layout>
  );
};

const defaultChainId = 5;
export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: true,
  };
};

export const getStaticProps = async (props) => {
  const { wearer } = props.params;
  const initialData = await fetchWearerDetails(wearer, defaultChainId);

  return {
    props: {
      wearerAddress: wearer,
      chainId: defaultChainId,
      initialData,
    },
  };
};

export default WearerDetail;
