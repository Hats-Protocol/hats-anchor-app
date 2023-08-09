import {
  Box,
  Button,
  Checkbox,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Image,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Radio,
  RadioGroup,
  Skeleton,
  Spinner,
  Stack,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { formatDistanceToNow } from 'date-fns';
import _ from 'lodash';
import { GetStaticPropsContext } from 'next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { BsPencil, BsToggles } from 'react-icons/bs';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';
import { IoCloseCircleOutline } from 'react-icons/io5';
import { useAccount } from 'wagmi';

import ChakraNextLink from '@/components/atoms/ChakraNextLink';
import Suspender from '@/components/atoms/Suspender';
import EventHistory from '@/components/EventHistory';
import Layout from '@/components/Layout';
import CONFIG from '@/constants';
import { useOverlay } from '@/contexts/OverlayContext';
import { fetchHatDetails, fetchTreeDetails } from '@/gql/helpers';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import useHatDetails from '@/hooks/useHatDetails';
import useImageURIs from '@/hooks/useImageURIs';
import useTreeDetails from '@/hooks/useTreeDetails';
import useWearerDetails from '@/hooks/useWearerDetails';
import { mapWithChainId } from '@/lib/general';
import {
  checkPermissionsResponsibilities,
  decimalId,
  decimalToTreeId,
  ipToHatId,
  isTopHat,
  toTreeStructure,
} from '@/lib/hats';
import { chainsMap, explorerUrl } from '@/lib/web3';
import { IControls, IHat, ITree } from '@/types';

const Modal = dynamic(() => import('@/components/atoms/Modal'));
const HatDrawer = dynamic(() => import('@/components/HatDrawer'), {
  ssr: false,
});
const OrgChart = dynamic(() => import('@/components/OrgChart'), { ssr: false });

interface TreeDetailsProps {
  treeId: string;
  chainId: number;
  topHatId: string;
  initialTreeData: ITree;
  linkedHats: IHat[];
  initialHatData: IHat;
}

const initialControls: IControls[] = [
  {
    label: 'Title Only',
    value: 'title',
    icon: <Image src='/icons/title.svg' alt='Title Icon' />,
  },
  // {
  //   label: 'Stats',
  //   value: 'stats',
  //   icon: <Image src='/icons/stats' alt='Stats Icon' />,
  // },
  {
    label: 'Wearers',
    value: 'wearers',
    icon: <Image src='/icons/wearers.svg' alt='Wearers Icon' />,
  },
  {
    label: 'Permissions',
    value: 'permissions',
    icon: <Image src='/icons/permissions.svg' alt='Permissions Icon' />,
  },
  {
    label: 'Responsibilities',
    value: 'responsibilities',
    icon: (
      <Image src='/icons/responsibilities.svg' alt='Responsibilities Icon' />
    ),
  },
  {
    label: 'Eligibility',
    value: 'eligibility',
    icon: <Image src='/icons/eligibility.svg' alt='Eligibility Icon' />,
  },
  {
    label: 'Toggle',
    value: 'toggle',
    icon: <Image src='/icons/toggle.svg' alt='Toggle icon' />,
  },
];

const TreeDetails = ({
  treeId,
  chainId,
  topHatId,
  initialTreeData,
  linkedHats,
  initialHatData,
}: TreeDetailsProps) => {
  const router = useRouter();
  const { hatId } = router.query;
  const { address } = useAccount();
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;

  const chain = chainsMap(chainId);
  const [editMode, setEditMode] = useState(false);
  const [orgChartTree, setOrgChartTree] = useState<IHat[]>([]);
  const [initialHats, setInitialHats] = useState<IHat[] | undefined>(undefined);
  const [selectedHatId, setSelectedHatId] = useState<string | undefined>(
    ipToHatId(String(hatId)) || topHatId,
  );
  const [selectedOption, setSelectedOption] = useState<string | undefined>(
    'wearers',
  );
  const [showInactiveHats, setInactiveHats] = useState<boolean>(true);
  const isMobile = useBetterMediaQuery('(max-width: 767px)');

  const { data: hatData } = useHatDetails({
    hatId: selectedHatId,
    chainId,
    initialData: initialHatData,
  });
  const { data: treeData } = useTreeDetails({
    treeId,
    chainId,
    initialData: initialTreeData,
  });
  const { data: wearerHats } = useWearerDetails({
    wearerAddress: address,
    chainId,
  });
  const { onOpen, onClose, isOpen } = useDisclosure();
  const {
    onOpen: onOpenShade,
    onClose: onCloseShade,
    isOpen: isOpenShade,
  } = useDisclosure();

  const handleSelectHat = useCallback(
    (id: string) => {
      if (isMobile) return;

      setSelectedHatId(id);

      const updatedQuery = {
        ...router.query,
        hatId: hatIdDecimalToIp(BigInt(id)),
      };
      const updatedUrl = {
        pathname: router.pathname,
        query: updatedQuery,
      };

      router.push(updatedUrl, undefined, { shallow: true });

      onOpenShade();
    },
    [isMobile, onOpenShade, router],
  );

  useEffect(() => {
    if (hatId && orgChartTree) {
      handleSelectHat(ipToHatId(String(hatId)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hatId, orgChartTree]);

  const events = _.get(treeData, 'events');
  const linkRequestFromTree = _.get(treeData, 'linkRequestFromTree');
  const title = `${isTopHat(hatData) ? 'Top ' : ''}Hat #${hatIdDecimalToIp(
    BigInt(_.get(hatData, 'id', '0')),
  )}`;
  // todo move to org chart
  const currentHats = _.map(_.filter(wearerHats, { chainId }), 'id');
  const { data: hatsWithImageData, isLoading: imagesDataLoading } =
    useImageURIs(initialHats, chainId);

  useEffect(() => {
    if (treeData && linkedHats) {
      setInitialHats(
        _.filter(
          _.concat(_.get(treeData, 'hats'), linkedHats),
          (x) => x,
        ) as IHat[],
      );
    }
    const fetchTreeAndSetState = async () => {
      const tree = await toTreeStructure({
        treeData,
        hatsImages: hatsWithImageData,
        chainId,
      });
      setOrgChartTree(tree);
    };

    if (treeData && !imagesDataLoading) {
      fetchTreeAndSetState();
    }
  }, [treeData, linkedHats, hatsWithImageData, imagesDataLoading, chainId]);

  const controls = checkPermissionsResponsibilities(
    orgChartTree,
    initialControls,
  );

  const toggleEditMode = () => {
    setEditMode(!editMode);
    setSelectedOption(editMode ? 'wearers' : 'title');
  };

  return (
    <>
      <NextSeo
        title={title}
        description={`Tree #${decimalId(treeId)} on ${chain?.name}`}
      />

      <Drawer
        placement='right'
        onClose={() => {
          onCloseShade();
          setEditMode(false);
          setSelectedHatId(undefined);
        }}
        isOpen={!!orgChartTree && isOpenShade}
      >
        <DrawerContent
          background={editMode ? 'cyan.50' : 'whiteAlpha.900'}
          maxW='43%'
          width='650px'
        >
          <DrawerBody pt={0}>
            <Suspense fallback={<Suspender />}>
              <HatDrawer
                chainId={chainId}
                selectedHatId={selectedHatId}
                setSelectedHatId={setSelectedHatId}
                hatsData={orgChartTree}
                linkRequestFromTree={linkRequestFromTree}
                onClose={onCloseShade}
                editMode={editMode}
                setEditMode={setEditMode}
              />
            </Suspense>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Layout editMode={editMode}>
        <Box
          bg='whiteAlpha.700'
          px={5}
          py={3}
          mb={5}
          position='absolute'
          top='75px'
          w='full'
          zIndex={4}
        >
          <Flex justify='space-between' align='center'>
            <Box>
              <Button
                mr={3}
                fontWeight='medium'
                border='1px solid #0987A0'
                background='#C4F1F9'
                color='#065666'
                leftIcon={
                  editMode ? (
                    <Icon as={IoCloseCircleOutline} />
                  ) : (
                    <Icon as={BsPencil} color='#065666' />
                  )
                }
                onClick={toggleEditMode}
              >
                {editMode ? 'Leave Edit Mode' : 'Edit Mode'}
              </Button>
              {/* <Button colorScheme="teal" mr={3}>
                Table View
              </Button> */}
              <Popover
                isOpen={isOpen}
                onOpen={onOpen}
                onClose={onClose}
                matchWidth
              >
                <PopoverTrigger>
                  <Button
                    leftIcon={
                      <Icon
                        as={BsToggles}
                        color={isOpen ? 'blue.500' : '#2D3748'}
                      />
                    }
                    rightIcon={isOpen ? <FaChevronUp /> : <FaChevronDown />}
                    fontWeight='medium'
                    border='1px solid'
                    borderColor='gray.700'
                    color={isOpen ? 'blue.500' : '#2D3748'}
                    bgColor='whiteAlpha.900'
                  >
                    View Controls
                  </Button>
                </PopoverTrigger>
                <PopoverContent w='250px'>
                  <PopoverArrow />
                  <PopoverBody p={6}>
                    <RadioGroup
                      onChange={setSelectedOption}
                      value={selectedOption}
                      w='100%'
                    >
                      <Stack direction='column' spacing={3}>
                        {controls.map((control: IControls) => (
                          <Radio value={control.value} key={control.value}>
                            <HStack>
                              {control.icon}
                              <Text>{control.label}</Text>
                            </HStack>
                          </Radio>
                        ))}
                      </Stack>
                    </RadioGroup>
                    <Divider my={4} />
                    <Checkbox
                      isChecked={showInactiveHats}
                      onChange={(e) => setInactiveHats(e.target.checked)}
                    >
                      <HStack>
                        <Image src='/icons/inactive.svg' alt='inactive icon' />
                        <Text>Inactive Hats</Text>
                      </HStack>
                    </Checkbox>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            </Box>
            <VStack align='center' alignItems='flex-end' spacing={1}>
              <Skeleton isLoaded={!!chain && !!orgChartTree}>
                <Flex align='center' mr={-1.5} gap={1} fontSize='sm'>
                  <Text>{`${CONFIG.appName} ${CONFIG.protocolVersion}:`}</Text>

                  <ChakraNextLink
                    href={`${explorerUrl(chainId)}/address/${
                      CONFIG.hatsAddress
                    }`}
                    isExternal
                  >
                    <HStack spacing={1}>
                      <Text fontWeight='medium'>{chain?.name}</Text>
                      <IconButton
                        aria-label='Explorer contract address'
                        icon={<Icon as={FiExternalLink} />}
                        size='xs'
                        variant='ghost'
                      />
                    </HStack>
                  </ChakraNextLink>
                </Flex>
              </Skeleton>
              <Skeleton isLoaded={!!_.get(_.first(events), 'timestamp')}>
                <Popover trigger='hover'>
                  <PopoverTrigger>
                    <Flex align='center' gap={1} fontSize='sm' cursor='pointer'>
                      <Text>Last event: </Text>
                      <Text mr={2} fontWeight='medium'>
                        {events?.[0]?.timestamp &&
                          formatDistanceToNow(
                            new Date(Number(events[0]?.timestamp) * 1000),
                          )}{' '}
                        ago
                      </Text>
                      <Image src='/icons/ago.svg' alt='History icon' />
                    </Flex>
                  </PopoverTrigger>
                  <PopoverContent width='400px' mr={4}>
                    <PopoverArrow />
                    <PopoverCloseButton />
                    <PopoverBody>
                      <Stack>
                        <Box>
                          <Heading
                            size='sm'
                            fontWeight='medium'
                            textTransform='uppercase'
                            mb={1}
                          >
                            Event history
                          </Heading>
                          <EventHistory
                            chainId={chainId}
                            events={events?.slice(0, 5)}
                          />
                          {_.gt(_.size(events), 4) && (
                            <>
                              <Divider my={2} />
                              <Button
                                onClick={() => setModals?.({ events: true })}
                                variant='link'
                                colorScheme='blue'
                              >
                                View Full History
                              </Button>
                            </>
                          )}
                        </Box>
                      </Stack>
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
              </Skeleton>
            </VStack>
          </Flex>
        </Box>

        {!_.isEmpty(orgChartTree) ? (
          <Suspense fallback={<Suspender />}>
            <OrgChart
              tree={orgChartTree}
              selectedOption={selectedOption}
              showInactiveHats={showInactiveHats}
              isLoading={imagesDataLoading}
              wearerHats={currentHats}
              chainId={chainId}
              selectedHatId={selectedHatId}
              onSelectHat={handleSelectHat}
            />
          </Suspense>
        ) : (
          <Flex justify='center' align='center' w='full' h='full'>
            <Spinner />
          </Flex>
        )}
      </Layout>

      <Modal
        name='events'
        title='Events'
        size='2xl'
        localOverlay={localOverlay}
      >
        <EventHistory chainId={chainId} events={events} />
      </Modal>
    </>
  );
};

export const getStaticProps = async (context: GetStaticPropsContext) => {
  const treeIdParam = _.get(context, 'params.treeId');
  const chainIdParam = _.get(context, 'params.chainId');
  const treeId = _.isArray(treeIdParam) ? _.first(treeIdParam) : treeIdParam;
  const chainId = _.isArray(chainIdParam)
    ? _.toNumber(_.first(chainIdParam))
    : _.toNumber(chainIdParam);
  if (!treeId || !chainId) {
    return { props: {} };
  }

  const treeHex = decimalToTreeId(treeId);
  const hatIdHex = ipToHatId(treeId);

  const promises = [
    fetchTreeDetails(treeHex, Number(chainId)),
    fetchHatDetails(hatIdHex, Number(chainId)),
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any[] = await Promise.all(promises);
  const treeData: ITree | null | undefined = _.first(data);
  const hatData: IHat | null | undefined = _.nth(data, 1);

  if (!treeData || !hatData) {
    return { props: {} };
  }

  const { linkedToHat, parentOfTrees } = treeData || {
    linkedToHat: { id: null },
    parentOfTrees: [],
  };

  const linkedHats = [];
  if (linkedToHat) {
    linkedHats.push({ id: linkedToHat });
  }
  if (parentOfTrees) {
    _.forEach(parentOfTrees, (tree: Partial<ITree>) => {
      linkedHats.push({
        id: tree.id,
        admin: {
          id: tree.linkedToHat?.id,
        },
        tree: tree.id,
      });
    });
  }

  return {
    props: {
      treeId: treeHex || null,
      chainId: _.toNumber(chainId),
      topHatId: hatIdHex || null,
      initialTreeData: treeData || null,
      linkedHats: mapWithChainId(linkedHats, chainId) || null,
      initialHatData: { ...hatData, chainId } || null,
    },
    revalidate: 5,
  };
};

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export default TreeDetails;
