/* eslint-disable no-use-before-define */
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Card,
  CardBody,
  CardHeader,
  Grid,
  Stack,
  Heading,
  Text,
  HStack,
  Flex,
  Spinner,
} from '@chakra-ui/react';
import _ from 'lodash';
import TreeGraph from 'react-d3-tree';
import { formatDistanceToNow } from 'date-fns';

import TransactionLink from '../../components/TransactionLink';
import Hat from '../../components/Hat';
import { toTreeStructure, prettyIdToId } from '../../lib/hats';
import useTreeDetails from '../../hooks/useTreeDetails';
import useHatDetails from '../../hooks/useHatDetails';
import { chainsMap } from '../../lib/web3';
import Layout from '../../components/Layout';

// TODO don't hardcode chainId
const defaultChainId = 5;

const TreeDetails = () => {
  const chain = chainsMap(defaultChainId);
  const router = useRouter();
  const { treeId } = router.query;
  const [currentHat, setCurrentHat] = useState(null);
  const {
    data: treeData,
    isLoading: treeLoading,
    error: treeError,
  } = useTreeDetails({ treeId, chainId: defaultChainId });
  const {
    data: hatData,
    isLoading: hatLoading,
    error: hatError,
  } = useHatDetails({ hatId: currentHat });
  console.log(hatData);

  useEffect(() => {
    if (_.get(treeData, 'tree.id') && !currentHat) {
      console.log(_.get(treeData, 'tree.id'));
      console.log(_.get(treeData, 'tree.hats[0].id'));
      setCurrentHat(_.get(treeData, 'tree.hats[0].id'));
    }
  }, [treeData, currentHat]);

  if (treeLoading)
    return (
      <Flex>
        <Spinner size='xl' />
      </Flex>
    );
  if (treeError) return <p>Error : {treeError.message}</p>;

  const tree = toTreeStructure(treeData);

  return (
    <Layout>
      <Grid gridTemplateColumns='repeat(2, 1fr)' gap={8}>
        {/* info table */}
        <Card>
          <CardHeader>
            <Heading size='lg'>Tree Info</Heading>
          </CardHeader>
          <CardBody>
            <Stack spacing={4}>
              <HStack spacing={2}>
                <Heading size='sm'>Network:</Heading>
                <Text>{chain?.name}</Text>
              </HStack>
              <HStack spacing={2}>
                <Heading size='sm'>Tree ID:</Heading>
                <Text>{treeId}</Text>
              </HStack>
            </Stack>
          </CardBody>
        </Card>
        {/* recent events table */}
        <Card>
          <CardHeader>
            <Heading size='lg'>Recent Events</Heading>
          </CardHeader>
          <CardBody>
            {treeData.tree.events.map((event, i) => (
              <EventRow
                id={event.id.split('-')[0]}
                transactionId={event.transactionID}
                timestamp={event.timestamp}
                chainId={defaultChainId}
                last={i === treeData.tree.events.length - 1}
                key={event.transactionID}
              />
            ))}
          </CardBody>
        </Card>
        {/* tree explorer */}
        <Card gridAutoRows='auto'>
          <CardBody minH='400px'>
            <TreeGraph
              data={tree}
              orientation='vertical'
              collapsible={false}
              rootNodeClassName='node__root'
              branchNodeClassName='node__branch'
              leafNodeClassName='node__leaf'
              nodeSize={{ x: 200, y: 200 }}
              translate={{ x: 200, y: 200 }}
              onNodeClick={(node, event) =>
                setCurrentHat(prettyIdToId(node.data.name))
              }
            />
          </CardBody>
        </Card>
        {/* hat data */}
        <Card gridAutoRows='auto'>
          <CardBody>
            {_.get(hatData, 'hat') && (
              <Hat hatData={hatData} chainId={defaultChainId} />
            )}
          </CardBody>
        </Card>
      </Grid>
    </Layout>
  );
};

const EventRow = ({ id, timestamp, transactionId, chainId, last }) => (
  <Flex justify='space-between' borderBottom={!last ? '1px solid' : 'none'}>
    <Text>{formatDistanceToNow(new Date(Number(timestamp) * 1000))}</Text>
    <Text>{id.split('-')[0]}</Text>
    <Text>
      <TransactionLink tx={transactionId} chainId={chainId} />
    </Text>
  </Flex>
);

// export const getStaticPaths = async () => {
//   return {
//     paths: [],
//     fallback: true,
//   };
// };

// export const getStaticProps = async () => {
//   return {
//     props: {},
//   };
// };

export default TreeDetails;
