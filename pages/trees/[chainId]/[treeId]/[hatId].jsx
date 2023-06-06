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

import EventsTable from '@/components/EventsTable';
import Hat from '@/components/Hat';
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
} from '@/lib/hats';
import { chainsMap } from '@/lib/web3';
import Layout from '@/components/Layout';
import { fetchHatDetails, fetchTreeDetails } from '@/gql/helpers';
import DataTable from '@/components/DataTable';
import { formatAddress } from '@/lib/general';
import { useOverlay } from '@/contexts/OverlayContext';
import Modal from '@/components/Modal';
import HatCreateForm from '@/forms/HatCreateForm';
import CopyToClipboard from '@/components/CopyToClipboard';
import useImageURIs from '@/hooks/useImageURIs';
import TreeNode from '@/components/TreeNode';
import useWearerDetails from '@/hooks/useWearerDetails';
import useContainerDimensions from '@/hooks/useContainerDimensions';
import HatLinkRequestCreateForm from '@/forms/HatLinkRequestCreateForm';
import HeadComponent from '@/components/HeadComponent';
import CONFIG from '@/constants';
import { fetchDetailsIpfs } from '@/hooks/useHatDetailsField';

const TreeGraph = dynamic(() => import('react-d3-tree'), { ssr: false });

const TreeDetails = ({
  treeId,
  chainId,
  hatId,
  prettyHatId,
  treeData,
  linkedHatIds,
  hatData,
  topHatData,
}) => {
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

  const wearerHats = _.map(_.get(wearerData, 'currentHats', []), 'prettyId');
  const wearerTopHats = _.map(
    _.filter(
      _.get(wearerData, 'currentHats', []),
      (hat) => isTopHat(hat) && hat?.prettyId !== prettyHatId,
    ),
    'prettyId',
  );

  const { data: imagesData, loading: imagesLoading } = useImageURIs(
    treeData?.hats?.map((hat) => hat.id).concat(linkedHatIds),
    chainId,
  );

  const { data: topHatEnsName } = useEnsName({
    address: _.get(_.first(_.get(topHatData, 'wearers')), 'id'),
    chainId: 1,
  });
  const childrenHats = descendantsOf(
    _.get(hatData, 'prettyId'),
    treeData,
    true,
  );

  const [defaultHatAdmin, setDefaultHatAdmin] = useState();

  // TODO handle error and loading in layout
  if (initialRender && imagesLoading) {
    setInitialRender(false);
    return (
      <Layout>
        <Flex justify='center' mt='200px'>
          <Spinner size='xl' />
        </Flex>
      </Layout>
    );
  }

  const tree = toTreeStructure(treeData, {}, imagesData);

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
          href={`/wearers/${_.get(
            _.first(_.get(topHatData, 'wearers')),
            'id',
          )}`}
          noOfLines={1}
        >
          {topHatEnsName ||
            formatAddress(_.get(_.first(_.get(topHatData, 'wearers')), 'id'))}
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
      <HeadComponent
        title={title}
        description={`Tree #${treeId} on ${chain?.name}`}
        url={`${CONFIG.url}/trees/${chainId}/${treeId}/${prettyIdToUrlId(
          prettyHatId,
        )}`}
        img={imagesData[hatId]}
      />

      <Modal name='createHat' title='Create Hat' localOverlay={localOverlay}>
        <HatCreateForm defaultAdmin={defaultHatAdmin} treeId={treeId} />
      </Modal>

      <Modal
        name='requestLink'
        title='Request to Link'
        localOverlay={localOverlay}
      >
        <HatLinkRequestCreateForm
          newAdmin={newAdmin}
          wearerTopHats={wearerTopHats}
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
                  bgImage={
                    imagesData[topHatData?.id]
                      ? `url('${imagesData[topHatData?.id]}')`
                      : "url('/icon.jpeg')"
                  }
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
                  nodeSize={{ x: 300, y: 200 }}
                  translate={{ x: 200, y: 200 }}
                  renderCustomNodeElement={(rd3tProps) =>
                    TreeNode({
                      rd3tProps,
                      handleNodeClick,
                      handleAddChildClick,
                      handleRequestLink,
                      activeHatId: hatId,
                      wearerHats,
                      chainId,
                    })
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
                  treeId={treeId}
                  hatImage={imagesData[hatId]}
                  childrenHats={childrenHats}
                  topHatDetails={topHatData?.detailsResolved}
                  parentOfTrees={_.get(treeData, 'parentOfTrees')}
                  linkedToHat={_.get(treeData, 'linkedToHat')}
                  linkRequestFromTree={_.get(treeData, 'linkRequestFromTree')}
                />
              )}
            </CardBody>
          </Card>
        </Grid>
      </Layout>
    </>
  );
};

export const getStaticProps = async (context) => {
  const { treeId, hatId, chainId } = context.params;
  const treeHex = decimalToTreeId(treeId);
  const prettyHatId = urlIdToPrettyId(hatId);
  const hatIdHex = prettyIdToId(prettyHatId);
  const treeData = await fetchTreeDetails(treeHex, chainId);
  const hatData = await fetchHatDetails(hatIdHex, chainId);
  let hatDetails;
  if (hatData?.details?.startsWith('ipfs://')) {
    hatDetails = await fetchDetailsIpfs(_.get(hatData, 'details'));
  }

  const topHatIdHex = _.get(treeData, 'hats[0].id');
  const topHatData = await fetchHatDetails(topHatIdHex, chainId);
  let topHatDetails;
  if (topHatData?.details?.startsWith('ipfs://')) {
    topHatDetails = await fetchDetailsIpfs(_.get(topHatData, 'details'));
  }

  const { linkedToHat, parentOfTrees } = treeData || {};
  const linkedHatIds = [];
  if (linkedToHat) {
    linkedHatIds.push(linkedToHat.id);
  }
  if (parentOfTrees) {
    linkedHatIds.push(...parentOfTrees.map((tree) => prettyIdToId(tree.id)));
  }

  return {
    props: {
      treeId: treeHex || null,
      chainId: _.toNumber(chainId),
      hatId: hatIdHex || null,
      prettyHatId: prettyHatId || null,
      treeData: treeData || null,
      linkedHatIds,
      hatData: {
        ...hatData,
        detailsResolved: hatDetails?.data || null,
      },
      topHatData: {
        ...topHatData,
        detailsResolved: topHatDetails?.data || null,
      },
    },
    revalidate: 10,
  };
};

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: true,
  };
};

export default TreeDetails;
