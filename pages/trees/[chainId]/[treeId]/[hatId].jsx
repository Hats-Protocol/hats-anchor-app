import { useRouter } from 'next/router';
import { useAccount } from 'wagmi';
import { useState } from 'react';
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
  Link as ChakraLink,
} from '@chakra-ui/react';
import Link from 'next/link';
import _ from 'lodash';
import dynamic from 'next/dynamic';

import EventsTable from '../../../../components/EventsTable';
import Hat from '../../../../components/Hat';
import {
  toTreeStructure,
  prettyIdToId,
  decimalToTreeId,
  decimalId,
  urlIdToPrettyId,
  prettyIdToUrlId,
} from '../../../../lib/hats';
import useTreeDetails from '../../../../hooks/useTreeDetails';
import useHatDetails from '../../../../hooks/useHatDetails';
import { chainsMap } from '../../../../lib/web3';
import Layout from '../../../../components/Layout';
import { fetchAllTreeIds, fetchTreeDetails } from '../../../../gql/helpers';
import DataTable from '../../../../components/DataTable';
import { formatAddress } from '../../../../lib/general';
import { useOverlay } from '../../../../contexts/OverlayContext';
import Modal from '../../../../components/Modal';
import HatCreateForm from '../../../../forms/HatCreateForm';
import CopyToClipboard from '../../../../components/CopyToClipboard';
import useImageURIs from '../../../../hooks/useImageURIs';
import TreeNode from '../../../../components/TreeNode';
import useWearerDetails from '../../../../hooks/useWearerDetails';

const TreeGraph = dynamic(() => import('react-d3-tree'), { ssr: false });

const TreeDetails = ({ treeId, chainId, hatId, initialData }) => {
  const chain = chainsMap(chainId);
  const router = useRouter();
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;

  const { address } = useAccount();
  const { data: wearerData } = useWearerDetails({
    wearerAddress: address,
    chainId,
  });
  let wearerHats = [];
  if (wearerData !== undefined) {
    wearerHats = _.get(wearerData, 'currentHats').map((hat) => {
      return hat.prettyId;
    });
  }

  const {
    data: treeData,
    isLoading: treeLoading,
    error: treeError,
  } = useTreeDetails({ treeId, chainId, initialData });

  const { data: imagesData, loading: imagesLoading } = useImageURIs(
    treeData?.hats,
    chainId,
  );

  const topHatId = _.get(treeData, 'hats[0].id');
  const { data: topHat } = useHatDetails({ hatId: topHatId });
  const { data: hatData } = useHatDetails({ hatId });

  const [defaultHatAdmin, setDefaultHatAdmin] = useState();

  // TODO handle error and loading in layout
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
  const events = _.get(treeData, 'events');

  const treeInfoTable = [
    {
      label: 'Tree ID',
      value: (
        <CopyToClipboard description='Tree ID'>
          {decimalId(treeId)}
        </CopyToClipboard>
      ),
    },
    {
      label: 'Top Hat Wearer',
      value: (
        <ChakraLink
          as={Link}
          href={`/wearers/${_.get(_.first(_.get(topHat, 'wearers')), 'id')}`}
        >
          {formatAddress(_.get(_.first(_.get(topHat, 'wearers')), 'id'))}
        </ChakraLink>
      ),
    },
    { label: 'Network', value: chain?.name },
  ];

  const handleNodeClick = (nodePrettyId) => {
    router.push(
      `/trees/${chainId}/${decimalId(treeId)}/${prettyIdToUrlId(nodePrettyId)}`,
    );
  };

  const handleAddChildClick = (nodePrettyId) => {
    setDefaultHatAdmin(nodePrettyId);
    setModals({ createHat: true });
  };

  return (
    <>
      <Modal name='createHat' title='Create Hat' localOverlay={localOverlay}>
        <HatCreateForm defaultAdmin={defaultHatAdmin} />
      </Modal>

      <Layout>
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
                  <DataTable data={treeInfoTable} labelWidth='45%' />
                </Stack>
              </HStack>
            </CardBody>
          </Card>
          {/* recent events table */}
          {events && (
            <Card zIndex={1}>
              <CardBody>
                <Stack>
                  <Heading size='md'>Recent Tree Events</Heading>
                  <EventsTable
                    events={_.slice(events, 0, 5)}
                    chainId={chainId}
                    treeId={treeId}
                    includeHatId
                  />
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
                  nodeSize={{ x: 200, y: 200 }}
                  translate={{ x: 200, y: 200 }}
                  renderCustomNodeElement={(rd3tProps) =>
                    TreeNode(
                      rd3tProps,
                      handleNodeClick,
                      handleAddChildClick,
                      hatId,
                      wearerHats,
                    )
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

  // convert from hex to numerical
  const paths = _.map(result, (tree) => {
    const treeId = decimalId(tree.id);

    const hatsMap = _.map(tree.hats, (hat) => {
      const hatId = prettyIdToUrlId(_.get(hat, 'prettyId'));

      return {
        params: {
          treeId: String(treeId),
          hatId: String(hatId),
          chainId: String(defaultChainId),
        },
      };
    });

    return hatsMap;
  });

  return {
    paths: _.flatten(paths),
    fallback: true,
  };
};

export const getStaticProps = async (props) => {
  const { treeId, hatId, chainId } = props.params;
  const treeHex = decimalToTreeId(treeId);
  const hatIdHex = prettyIdToId(urlIdToPrettyId(hatId));
  const initialData = await fetchTreeDetails(
    treeHex,
    chainId || defaultChainId,
  );

  return {
    props: {
      treeId: treeHex,
      hatId: hatIdHex,
      chainId: chainId || defaultChainId,
      initialData,
    },
  };
};

export default TreeDetails;
