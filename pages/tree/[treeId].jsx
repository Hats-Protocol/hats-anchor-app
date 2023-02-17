import { useState, useEffect } from 'react';
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
import dynamic from 'next/dynamic';

import EventRow from '../../components/EventRow';
import Hat from '../../components/Hat';
import { toTreeStructure, prettyIdToId } from '../../lib/hats';
import useTreeDetails from '../../hooks/useTreeDetails';
import useHatDetails from '../../hooks/useHatDetails';
import { chainsMap } from '../../lib/web3';
import Layout from '../../components/Layout';
import { fetchAllTreeIds, fetchTreeDetails } from '../../gql/helpers';

const TreeGraph = dynamic(() => import('react-d3-tree'), { ssr: false });

const TreeDetails = ({ treeId, chainId, initialData }) => {
  const chain = chainsMap(chainId);
  const [currentHat, setCurrentHat] = useState(null);
  const {
    data: treeData,
    isLoading: treeLoading,
    error: treeError,
  } = useTreeDetails({ treeId, chainId, initialData });
  const { data: hatData } = useHatDetails({ hatId: currentHat });

  useEffect(() => {
    if (_.get(treeData, 'tree.id') && !currentHat) {
      // Set the default hat to the top hat
      setCurrentHat(_.get(treeData, 'tree.hats[0].id'));
    }
  }, [treeData, currentHat]);

  // TODO handle error and loading in layout
  if (treeLoading)
    return (
      <Layout>
        <Flex justify='center' mt='200px'>
          <Spinner size='xl' />
        </Flex>
      </Layout>
    );
  if (treeError) return <p>Error : {treeError.message}</p>;

  const tree = toTreeStructure(treeData);
  const events = _.get(treeData, 'tree.events');

  return (
    <Layout>
      <Grid gridTemplateColumns='repeat(2, 1fr)' gap={8}>
        {/* info table */}
        <Card>
          <CardHeader>
            <Heading size='md'>Tree Info</Heading>
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
        {events && (
          <Card>
            <CardHeader>
              <Heading size='md'>Recent Events</Heading>
            </CardHeader>
            <CardBody>
              {_.map(events, (event, i) => (
                <EventRow
                  id={event.id.split('-')[0]}
                  transactionId={event.transactionID}
                  timestamp={event.timestamp}
                  chainId={chainId}
                  last={i === treeData.tree.events.length - 1}
                  key={event.transactionID}
                />
              ))}
            </CardBody>
          </Card>
        )}

        {/* tree explorer */}
        {!_.isEmpty(tree) && (
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
                onNodeClick={(node) =>
                  setCurrentHat(prettyIdToId(node.data.name))
                }
              />
            </CardBody>
          </Card>
        )}

        {/* hat data */}
        <Card gridAutoRows='auto'>
          <CardBody>
            {_.get(hatData, 'hat') && (
              <Hat hatData={hatData} chainId={chainId} />
            )}
          </CardBody>
        </Card>
      </Grid>
    </Layout>
  );
};

// TODO don't hardcode chainId
const defaultChainId = 5;

export const getStaticPaths = async () => {
  // TODO handle multiple chains
  const result = await fetchAllTreeIds(defaultChainId);

  const paths = _.map(_.get(result, 'trees'), (tree) => ({
    params: { treeId: tree.id, chainId: defaultChainId },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps = async (props) => {
  const { treeId, chainId } = props.params;
  // TODO do we need to pass `chainId` in the params? yes cause conflicts will exist on treeId
  const result = await fetchTreeDetails(treeId, chainId || defaultChainId);

  return {
    props: {
      treeId,
      chainId: chainId || defaultChainId,
      initialData: _.get(result, 'tree', null),
    },
  };
};

export default TreeDetails;
