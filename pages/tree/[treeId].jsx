/* eslint-disable no-use-before-define */
import { useState } from 'react';
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
import TreeGraph from 'react-d3-tree';

import TransactionLink from '../../components/TransactionLink';
import Hat from '../../components/Hat';
import { toTreeStructure } from '../../lib/hats';
import useTreeDetails from '../../hooks/useTreeDetails';
import useHatDetails from '../../hooks/useHatDetails';
import { chainsMap } from '../../lib/web3';

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

  if (treeLoading)
    return (
      <Flex>
        <Spinner size='xl' />
      </Flex>
    );
  if (treeError) return <p>Error : {treeError.message}</p>;

  const tree = toTreeStructure(treeData);
  console.log('treeData', treeData);
  console.log('hatData', hatData);
  console.log('tree', tree);

  return (
    <Grid>
      {/* info table */}
      <Card>
        <CardHeader>
          <Heading>Tree Info</Heading>
        </CardHeader>
        <CardBody>
          <Stack spacing={4}>
            <HStack spacing={2}>
              <Heading size='lg'>Network:</Heading>
              <Text>{chain?.name}</Text>
            </HStack>
            <HStack spacing={2}>
              <Heading size='lg'>Tree ID:</Heading>
              <Text>{treeId}</Text>
            </HStack>
          </Stack>
        </CardBody>
      </Card>
      {/* recent events table */}
      <Card>
        <CardHeader>
          <Heading>Recent Events</Heading>
        </CardHeader>
        <CardBody>
          <EventRow
            id={treeData.tree.events[0].id.split('-')[0]}
            transactionId={treeData.tree.events[0].transactionID}
            timestamp={treeData.tree.events[0].timestamp}
            chainId={defaultChainId}
            last={false}
          />
          <EventRow
            id={treeData.tree.events[1].id.split('-')[0]}
            transactionId={treeData.tree.events[1].transactionID}
            timestamp={treeData.tree.events[1].timestamp}
            chainId={defaultChainId}
            last={false}
          />
          <EventRow
            id={treeData.tree.events[2].id.split('-')[0]}
            transactionId={treeData.tree.events[2].transactionID}
            timestamp={treeData.tree.events[2].timestamp}
            chainId={defaultChainId}
            last={false}
          />
          <EventRow
            id={treeData.tree.events[3].id.split('-')[0]}
            transactionId={treeData.tree.events[3].transactionID}
            timestamp={treeData.tree.events[3].timestamp}
            chainId={defaultChainId}
            last={false}
          />
          <EventRow
            id={treeData.tree.events[4].id.split('-')[0]}
            transactionId={treeData.tree.events[4].transactionID}
            timestamp={treeData.tree.events[4].timestamp}
            chainId={defaultChainId}
            last
          />
        </CardBody>
      </Card>
      {/* tree explorer */}
      <Card>
        <CardBody>
          {/* <TreeGraph
            data={tree}
            orientation='vertical'
            collapsible={false}
            rootNodeClassName='node__root'
            branchNodeClassName='node__branch'
            leafNodeClassName='node__leaf'
            nodeSize={{ x: 200, y: 200 }}
            translate={{ x: 200, y: 200 }}
            // onNodeClick={(node, event) =>
            //   getHat({ variables: { id: prettyIdToId(node.data.name) } })
            // }
          /> */}
        </CardBody>
      </Card>
      {/* hat data */}
      <Card>
        <CardBody>
          {/* <Hat
            hatData={hatData}
            hatLoading={hatLoading}
            hatError={hatError}
            network={networkId}
          /> */}
        </CardBody>
      </Card>
    </Grid>
  );
};

function EventRow({ id, timestamp, transactionId, chainId, last }) {
  if (last) {
    return (
      <div className='flex mx-2'>
        <div className=' flex-none w-36 my-2'>
          {/* <ReactTimeAgo
            date={new Date(Number(timestamp) * 1000)}
            locale='en-US'
          /> */}
        </div>
        <div className=' my-2'>{id.split('-')[0]}</div>
        <div className=' my-2 ml-4'>
          <TransactionLink tx={transactionId} chainId={chainId} />
        </div>
      </div>
    );
  }

  return (
    <div className='flex mx-2 border-b'>
      <div className=' flex-none w-36 my-2'>
        {/* <ReactTimeAgo
          date={new Date(Number(timestamp) * 1000)}
          locale='en-US'
        /> */}
      </div>
      <div className=' my-2'>{id.split('-')[0]}</div>
      <div className=' my-2 ml-4'>
        <TransactionLink tx={transactionId} chainId={chainId} />
      </div>
    </div>
  );
}

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
