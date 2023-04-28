import { useRouter } from 'next/router';
import { useAccount, useChainId, useEnsName } from 'wagmi';
import { switchNetwork } from '@wagmi/core';
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
  Box,
  Link as ChakraLink,
  Button,
} from '@chakra-ui/react';
import Link from 'next/link';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { NextSeo } from 'next-seo';

import EventsTable from '../../../../components/EventsTable';
import Hat from '../../../../components/Hat';
import {
  toTreeStructure,
  prettyIdToId,
  decimalToTreeId,
  decimalId,
  urlIdToPrettyId,
  prettyIdToUrlId,
  descendantsOf,
  prettyIdToIp,
  isTopHat,
} from '../../../../lib/hats';
import useTreeDetails from '../../../../hooks/useTreeDetails';
import useHatDetails from '../../../../hooks/useHatDetails';
import { chainsMap } from '../../../../lib/web3';
import Layout from '../../../../components/Layout';
import { fetchTreeDetails } from '../../../../gql/helpers';
import DataTable from '../../../../components/DataTable';
import { formatAddress } from '../../../../lib/general';
import { useOverlay } from '../../../../contexts/OverlayContext';
import Modal from '../../../../components/Modal';
import HatCreateForm from '../../../../forms/HatCreateForm';
import CopyToClipboard from '../../../../components/CopyToClipboard';
import useImageURIs from '../../../../hooks/useImageURIs';
import TreeNode from '../../../../components/TreeNode';
import useWearerDetails from '../../../../hooks/useWearerDetails';
import useContainerDimensions from '../../../../hooks/useContainerDimensions';
import LinkRequestCreateForm from '../../../../forms/LinkRequestCreateForm';

const TreeGraph = dynamic(() => import('react-d3-tree'), { ssr: false });

const TreeDetails = ({ treeId, chainId, hatId, prettyHatId, initialData }) => {
  const [initialRender, setInitialRender] = useState(true);
  const [newAdmin, setNewAdmin] = useState('');
  const chain = chainsMap(chainId);
  const router = useRouter();
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;

  const [dimensions, containerRef] = useContainerDimensions();

  const { address } = useAccount();
  const userChain = useChainId();
  const { data: wearerData } = useWearerDetails({
    wearerAddress: address,
    chainId,
  });

  let wearerHats = [];
  let wearerTopHats = [];

  if (wearerData !== undefined) {
    wearerHats = _.get(wearerData, 'currentHats')?.map((hat) => {
      return hat?.prettyId;
    });
    wearerTopHats = _.get(wearerData, 'currentHats')
      ?.filter((hat) => isTopHat(hat))
      .map((hat) => {
        return hat.prettyId;
      });
  }

  const {
    data: treeData,
    isLoading: treeLoading,
    error: treeError,
    linkedHatIds,
  } = useTreeDetails({ treeId, chainId, hatId, initialData });

  const { data: imagesData, loading: imagesLoading } = useImageURIs(
    treeData?.hats?.map((hat) => hat.id).concat(linkedHatIds),
    chainId,
  );

  const topHatId = _.get(treeData, 'hats[0].id');
  const { data: topHat } = useHatDetails({ hatId: topHatId, chainId });
  const { data: hatData } = useHatDetails({ hatId, chainId });
  const { data: topHatEnsName } = useEnsName({
    address: _.get(_.first(_.get(topHat, 'wearers')), 'id'),
    chainId: 1,
  });
  const childrenHats = descendantsOf(
    _.get(hatData, 'prettyId'),
    treeData,
    true,
  );

  const [defaultHatAdmin, setDefaultHatAdmin] = useState();

  // TODO handle error and loading in layout
  if (initialRender && (treeLoading || imagesLoading)) {
    setInitialRender(false);
    return (
      <Layout>
        <Flex justify='center' mt='200px'>
          <Spinner size='xl' />
        </Flex>
      </Layout>
    );
  }
  if (treeError) return <p>Error : {treeError.message}</p>;

  const tree = toTreeStructure(treeData, imagesData);
  const events = _.get(treeData, 'events');
  const treeInfoTable = [
    {
      label: 'Tree ID',
      value: (
        <CopyToClipboard
          description='Tree ID'
          copyValue={_.get(treeData, 'id')}
        >
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
          noOfLines={1}
        >
          {topHatEnsName ||
            formatAddress(_.get(_.first(_.get(topHat, 'wearers')), 'id'))}
        </ChakraLink>
      ),
    },
    {
      label: 'Network',
      value:
        !address || !userChain || chain?.id === userChain ? (
          chain?.name
        ) : (
          <Button
            variant='outline'
            size='sm'
            onClick={() =>
              switchNetwork({
                chainId: chain?.id,
              })
            }
          >
            Switch to {chain?.name}
          </Button>
        ),
    },
    ...(treeData?.linkedToHat
      ? [
          {
            label: 'Child of',
            value: (
              <ChakraLink
                as={Link}
                href={`/trees/${chainId}/${decimalId(
                  treeData.linkedToHat.tree.id,
                )}/${prettyIdToUrlId(treeData.linkedToHat.prettyId)}`}
                noOfLines={1}
              >
                {prettyIdToIp(treeData.linkedToHat.prettyId)}
              </ChakraLink>
            ),
          },
        ]
      : []),
  ];

  const handleNodeClick = (nodePrettyId, nodeTreeId) => {
    router.push(
      `/trees/${chainId}/${decimalId(nodeTreeId)}/${prettyIdToUrlId(
        nodePrettyId,
      )}`,
      undefined,
      { scroll: false },
    );
  };

  const handleAddChildClick = (nodePrettyId) => {
    setDefaultHatAdmin(nodePrettyId);
    setModals({ createHat: true });
  };

  const handleRequestLink = (nodePrettyId) => {
    setNewAdmin(nodePrettyId);
    setModals({ requestLink: true });
  };

  // "Top Hat #21 or Hat #2.3.4"
  const title = `${isTopHat(hatData) ? 'Top ' : ''}Hat #${prettyIdToIp(
    _.get(hatData, 'prettyId'),
  )}`;

  return (
    <>
      <NextSeo title={title} />

      <Modal name='createHat' title='Create Hat' localOverlay={localOverlay}>
        <HatCreateForm defaultAdmin={defaultHatAdmin} treeId={treeId} />
      </Modal>

      <Modal
        name='requestLink'
        title='Request to Link'
        localOverlay={localOverlay}
      >
        <LinkRequestCreateForm
          newAdmin={newAdmin}
          wearerHats={wearerTopHats.filter((hat) => hat !== prettyHatId)}
          chainId={chainId}
        />
      </Modal>

      <Layout>
        <Grid gridTemplateColumns='repeat(2, 1fr)' gap={8}>
          {/* info table */}
          <Card>
            <CardBody>
              <HStack align='flex-start' spacing={4}>
                <Box
                  bgImage={imagesData[topHatId] ?? '/icon.jpeg'}
                  bgSize='cover'
                  bgPosition='center'
                  alt='Top Hat image'
                  w='200px'
                  h='200px'
                  border='1px solid'
                  borderColor='gray.200'
                />
                <Stack spacing={4} w='60%'>
                  <Heading size='md'>Tree Details</Heading>
                  <DataTable data={treeInfoTable} labelWidth='40%' />
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
              <CardBody minH='400px' ref={containerRef}>
                <TreeGraph
                  data={tree}
                  dimensions={dimensions}
                  orientation='vertical'
                  collapsible={false}
                  nodeSize={{ x: 200, y: 200 }}
                  translate={{ x: 200, y: 200 }}
                  renderCustomNodeElement={(rd3tProps) =>
                    TreeNode(
                      rd3tProps,
                      handleNodeClick,
                      handleAddChildClick,
                      handleRequestLink,
                      hatId,
                      wearerHats,
                      chainId,
                      wearerData,
                    )
                  }
                  pathClassFunc={({ target }) =>
                    target.data.attributes.dottedLine ? 'dotted-link' : ''
                  }
                />
              </CardBody>
            </Card>
          )}

          {/* hat data */}
          <Card gridAutoRows='auto'>
            <CardBody>
              {hatData && (
                <Hat
                  hatData={hatData}
                  chainId={chainId}
                  hatImage={imagesData[hatId]}
                  childrenHats={childrenHats}
                  linkRequestFromTree={treeData?.linkRequestFromTree}
                />
              )}
            </CardBody>
          </Card>
        </Grid>
      </Layout>
    </>
  );
};

export const getServerSideProps = async (context) => {
  const { treeId, hatId, chainId } = context.params;
  const treeHex = decimalToTreeId(treeId);
  const prettyHatId = urlIdToPrettyId(hatId);
  const hatIdHex = prettyIdToId(prettyHatId);
  const initialData = await fetchTreeDetails(treeHex, chainId);

  return {
    props: {
      treeId: treeHex,
      hatId: hatIdHex,
      prettyHatId,
      chainId: _.toNumber(chainId),
      initialTree: initialData,
      initialHat: _.find(_.get(initialData, 'hats'), { id: hatIdHex }),
      topHat: _.get(initialData, 'hats[0]'),
    },
  };
};

export default TreeDetails;
