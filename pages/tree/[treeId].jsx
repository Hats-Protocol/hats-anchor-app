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
  Icon,
} from '@chakra-ui/react';
import _ from 'lodash';
import TreeGraph from 'react-d3-tree';
import { formatDistanceToNow } from 'date-fns';
import { FaExternalLinkAlt } from 'react-icons/fa';

import Link from '../../components/ChakraNextLink';
import Hat from '../../components/Hat';
import { toTreeStructure, prettyIdToId } from '../../lib/hats';
import { explorerUrl } from '../../lib/general';
import useTreeDetails from '../../hooks/useTreeDetails';
import useHatDetails from '../../hooks/useHatDetails';
import useImageURIs from '../../hooks/useImageURIs';
import { chainsMap } from '../../lib/web3';
import Layout from '../../components/Layout';
import { TreeNode } from '../../components/TreeNode';

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
  const { data: hatData } = useHatDetails({ hatId: currentHat });

  const { data: imagesData, loading: imagesLoading } = useImageURIs(
    treeData?.tree.hats,
  );

  useEffect(() => {
    if (_.get(treeData, 'tree.id')) {
      setCurrentHat(_.get(treeData, 'tree.hats[0].id'));
    }
  }, [treeData]);

  if (treeLoading || imagesLoading)
    return (
      <Layout>
        <Flex justify='center' mt='200px'>
          <Spinner size='xl' />
        </Flex>
      </Layout>
    );
  if (treeError) return <p>Error : {treeError.message}</p>;

  const tree = toTreeStructure(treeData, imagesData);

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
        <Card>
          <CardHeader>
            <Heading size='md'>Recent Events</Heading>
          </CardHeader>
          <CardBody>
            {treeData.tree.events.map((event, i) => (
              <EventRow
                id={event.id.split('-')[0]}
                transactionId={event.transactionID}
                timestamp={event.timestamp}
                chainId={defaultChainId}
                last={i === treeData.tree.events.length - 1}
                key={i}
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
              nodeSize={{ x: 200, y: 200 }}
              translate={{ x: 200, y: 200 }}
              renderCustomNodeElement={(rd3tProps) =>
                TreeNode(rd3tProps, setCurrentHat)
              }
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
  <Link isExternal href={`${explorerUrl(chainId)}/tx/${transactionId}`}>
    <Flex
      justify='space-between'
      align='center'
      borderBottom={!last ? '1px solid' : 'none'}
      p={1}
    >
      <HStack spacing={2}>
        <Text>{`${formatDistanceToNow(
          new Date(Number(timestamp) * 1000),
        )} ago`}</Text>
        <Text>-</Text>
        <Text>{id.split('-')[0]}</Text>
      </HStack>

      <Icon as={FaExternalLinkAlt} />
    </Flex>
  </Link>
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
