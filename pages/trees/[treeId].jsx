import { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  Grid,
  Stack,
  Heading,
  HStack,
  Flex,
  Spinner,
  Image,
  Button,
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
import DataTable from '../../components/DataTable';
import { formatAddress } from '../../lib/general';
import { useOverlay } from '../../contexts/OverlayContext';
import Modal from '../../components/Modal';
import HatCreateForm from '../../forms/CreateHatForm';

const TreeGraph = dynamic(() => import('react-d3-tree'), { ssr: false });

const TreeDetails = ({ treeId, chainId, initialData }) => {
  const chain = chainsMap(chainId);
  const [currentHatId, setCurrentHatId] = useState(null);
  const [topHatId, setTopHatId] = useState(null);
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;
  const { data: topHat } = useHatDetails({ hatId: topHatId });
  const {
    data: treeData,
    isLoading: treeLoading,
    error: treeError,
  } = useTreeDetails({ treeId, chainId, initialData });
  const { data: hatData } = useHatDetails({ hatId: currentHatId });

  useEffect(() => {
    if (_.get(treeData, 'id') && !currentHatId) {
      // Set the default hat to the top hat
      setTopHatId(_.get(treeData, 'hats[0].id'));
      setCurrentHatId(_.get(treeData, 'hats[0].id'));
    }
  }, [treeData, currentHatId]);
  console.log(topHat);

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
  const events = _.get(treeData, 'events');

  const treeInfoTable = [
    { label: 'Tree ID', value: treeId },
    {
      label: 'Top Hat Wearer',
      value: formatAddress(_.get(_.first(_.get(topHat, 'wearers')), 'id')),
    },
    { label: 'Network', value: chain?.name },
  ];

  return (
    <>
      <Modal name='createHat' title='Create Hat' localOverlay={localOverlay}>
        <HatCreateForm />
      </Modal>

      <Layout>
        {/* temp buttons */}
        <Flex mb={6}>
          <Button
            variant='outline'
            onClick={() => setModals({ createHat: true })}
          >
            Create Hat
          </Button>
        </Flex>
        <Grid gridTemplateColumns='repeat(2, 1fr)' gap={8}>
          {/* info table */}
          <Card>
            <CardBody>
              <HStack align='flex-start' spacing={4}>
                <Image
                  src='/icon.jpeg'
                  alt='Top Hat image'
                  maxW='200px'
                  border='1px solid'
                  borderColor='gray.200'
                />
                <Stack spacing={4} w='60%'>
                  <Heading size='md'>Tree Details</Heading>
                  <DataTable data={treeInfoTable} labelWidth='50%' />
                </Stack>
              </HStack>
            </CardBody>
          </Card>
          {/* recent events table */}
          {events && (
            <Card zIndex={1}>
              <CardBody>
                <Stack>
                  <Heading size='md'>Recent Events</Heading>
                  {_.map(_.slice(events, 0, 5), (event, i) => (
                    <EventRow
                      id={event.id.split('-')[0]}
                      transactionId={event.transactionID}
                      timestamp={event.timestamp}
                      chainId={chainId}
                      last={i === treeData.events.length - 1}
                      key={event.transactionID}
                    />
                  ))}
                </Stack>
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
                    setCurrentHatId(prettyIdToId(node.data.name))
                  }
                />
              </CardBody>
            </Card>
          )}

          {/* hat data */}
          <Card gridAutoRows='auto'>
            <CardBody>
              {hatData && <Hat hatData={hatData} chainId={chainId} />}
            </CardBody>
          </Card>
        </Grid>
      </Layout>
    </>
  );
};

// TODO don't hardcode chainId
const defaultChainId = 5;

export const getStaticPaths = async () => {
  // TODO handle multiple chains
  const result = await fetchAllTreeIds(defaultChainId);

  const paths = _.map(result, (tree) => ({
    params: { treeId: tree.id, chainId: defaultChainId },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps = async (props) => {
  const { treeId, chainId } = props.params;
  const initialData = await fetchTreeDetails(treeId, chainId || defaultChainId);

  return {
    props: {
      treeId,
      chainId: chainId || defaultChainId,
      initialData,
    },
  };
};

export default TreeDetails;
