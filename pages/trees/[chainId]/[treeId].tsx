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
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
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
import { formatDistanceToNow } from 'date-fns';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import { ReactNode, Suspense, useCallback, useEffect, useState } from 'react';
import { BsToggles } from 'react-icons/bs';
import { FaChevronDown, FaChevronUp, FaExternalLinkAlt } from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';
import { useAccount } from 'wagmi';

import ChakraNextLink from '@/components/atoms/ChakraNextLink';
import Suspender from '@/components/atoms/Suspender';
import Layout from '@/components/Layout';
import CONFIG from '@/constants';
import { fetchHatDetails, fetchTreeDetails } from '@/gql/helpers';
import useImageURIs from '@/hooks/useImageURIs';
import useWearerDetails from '@/hooks/useWearerDetails';
import { mapWithChainId } from '@/lib/general';
import {
  decimalId,
  decimalToTreeId,
  ipToPrettyId,
  isTopHat,
  prettyIdToId,
  prettyIdToIp,
  toTreeStructure,
} from '@/lib/hats';
import { chainsMap, explorerUrl } from '@/lib/web3';
import { HierarchyObject, IHat, IHatData, IHatEvent, ITree } from '@/types';

const HatDrawer = dynamic(() => import('@/components/HatDrawer'));
const OrgChart = dynamic(() => import('@/components/OrgChart'), { ssr: false });

interface TreeDetailsProps {
  treeId: string;
  chainId: number;
  topHatId: string;
  treeData: ITree;
  linkedHats: IHat[];
  hatData: IHat;
}

interface IControls {
  label: string;
  value: string;
  icon: ReactNode;
}

const controls: IControls[] = [
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
  treeData,
  linkedHats,
  hatData,
}: TreeDetailsProps) => {
  const router = useRouter();
  const { hatId } = router.query;
  const { address } = useAccount();

  const chain = chainsMap(chainId);
  const [editMode, setEditMode] = useState(false);
  const [orgChartTree, setOrgChartTree] = useState<IHat[]>([]);
  const [initialHats, setInitialHats] = useState<IHat[] | undefined>(undefined);
  const [hatsData, setHatsData] = useState<IHatData[] | undefined>(undefined);
  const [hierarchyData, setHierarchyData] = useState<HierarchyObject[]>([]);
  const [selectedHatId, setSelectedHatId] = useState<string | undefined>(
    ipToPrettyId(String(hatId)) || topHatId,
  );
  const [selectedOption, setSelectedOption] = useState<string | undefined>(
    'wearers',
  );
  const [showInactiveHats, setInactiveHats] = useState<boolean>(true);

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

  const {
    isOpen: isEventsModalOpen,
    onOpen: handleOpenModal,
    onClose: handleCloseModal,
  } = useDisclosure();

  const handleSelectHat = useCallback(
    (id: string) => {
      setSelectedHatId(id);

      const updatedQuery = { ...router.query, hatId: prettyIdToIp(id) };
      const updatedUrl = {
        pathname: router.pathname,
        query: updatedQuery,
      };

      router.push(updatedUrl, undefined, { shallow: true });

      onOpenShade();
    },
    [onOpenShade, router],
  );

  useEffect(() => {
    if (hatId && hatsData) {
      handleSelectHat(ipToPrettyId(String(hatId)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hatId, hatsData]);

  const events = _.get(treeData, 'events');
  const linkRequestFromTree = _.get(treeData, 'linkRequestFromTree');
  const title = `${isTopHat(hatData) ? 'Top ' : ''}Hat #${prettyIdToIp(
    _.get(hatData, 'prettyId'),
  )}`;
  const currentHats = _.map(_.filter(wearerHats, { chainId }), 'prettyId');
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
      const { tree, hats, hierarchy } = await toTreeStructure({
        treeData,
        hatsImages: hatsWithImageData,
        chainId,
      });
      setHatsData(hats);
      setOrgChartTree(tree);
      setHierarchyData(hierarchy);
    };

    if (treeData && !imagesDataLoading) {
      fetchTreeAndSetState();
    }
  }, [treeData, linkedHats, hatsWithImageData, imagesDataLoading, chainId]);

  const hasPermissions = !_.isEmpty(
    _.filter(orgChartTree, (node: IHatData) => {
      return (
        typeof node.details !== 'string' &&
        _.includes(_.keys(node.details), 'permissions')
      );
    }),
  );
  const hasResponsibilities = !_.isEmpty(
    _.filter(orgChartTree, (node: IHatData) => {
      return (
        typeof node.details !== 'string' &&
        _.includes(_.keys(node.details), 'responsibilities')
      );
    }),
  );

  if (!hasPermissions) {
    _.remove(controls, (control: IControls) => control.value === 'permissions');
  }
  if (!hasResponsibilities) {
    _.remove(
      controls,
      (control: IControls) => control.value === 'responsibilities',
    );
  }

  const fullHatData: any[] = _.map(hatsData, (hat: IHat, index: number) => ({
    ...hatsWithImageData?.[index],
    ...hat,
  }));

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
        isOpen={isOpenShade}
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
                hatsData={fullHatData}
                hierarchyData={hierarchyData}
                linkRequestFromTree={linkRequestFromTree}
                onClose={onCloseShade}
                editMode={editMode}
                setEditMode={setEditMode}
              />
            </Suspense>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Layout>
        <Box
          bg='gray.100'
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
              {/* <Button
                mr={3}
                fontWeight={500}
                border='1px solid #0987A0'
                background='#C4F1F9'
                color='#065666'
                leftIcon={isEditMode ? <Close /> : <Edit color='#065666' />}
                onClick={() => setIsEditMode(!isEditMode)}
              >
                {isEditMode ? 'Leave Edit Mode' : 'Edit Tree'}
              </Button> */}
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
                    fontWeight={500}
                    border='1px solid #2D3748'
                    color={isOpen ? 'blue.500' : '#2D3748'}
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
                      <Text fontWeight={500}>{chain?.name}</Text>
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
                      <Text mr={2} fontWeight={500}>
                        {events?.[0]?.timestamp &&
                          formatDistanceToNow(
                            new Date(Number(events[0]?.timestamp) * 1000),
                          )}{' '}
                        ago
                      </Text>
                      <Image src='/icons/ago.svg' alt='History icon' />
                    </Flex>
                  </PopoverTrigger>
                  <PopoverContent>
                    <PopoverArrow />
                    <PopoverCloseButton />
                    <PopoverBody>
                      <Stack>
                        <Heading
                          size='sm'
                          fontWeight='medium'
                          textTransform='uppercase'
                        >
                          Event history
                        </Heading>
                        <Box>
                          {events?.slice(0, 5).map((event: IHatEvent) => (
                            <Event
                              key={`${event?.transactionID}-${event?.id}`}
                              event={event}
                              chainId={chainId}
                            />
                          ))}
                          {events?.length > 4 && (
                            <>
                              <Divider my={2} />
                              <Button
                                onClick={handleOpenModal}
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

      <Modal isOpen={isEventsModalOpen} onClose={handleCloseModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Event History</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {events?.map((event: IHatEvent) => (
              <Event
                key={`${event?.transactionID}-${event?.id}`}
                event={event}
                chainId={chainId}
              />
            ))}
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' onClick={handleCloseModal}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

const Event = ({ event, chainId }: { event: IHatEvent; chainId: number }) => {
  return (
    <Flex
      key={`${event?.transactionID}-${event?.id}`}
      align='center'
      justify='space-between'
      py={2}
    >
      <Text>{`${formatDistanceToNow(
        new Date(Number(event?.timestamp) * 1000),
      )} ago`}</Text>

      <ChakraNextLink
        isExternal
        href={`${explorerUrl(chainId)}/tx/${event?.transactionID}`}
        display='block'
      >
        <HStack spacing={3}>
          <Text>{event?.id?.split('-')[0]}</Text>
          <Icon as={FaExternalLinkAlt} w='12px' color='blue.500' />
        </HStack>
      </ChakraNextLink>
    </Flex>
  );
};

export const getStaticProps = async (context: any) => {
  const { treeId, chainId } = context.params;
  const treeHex = decimalToTreeId(treeId);
  const prettyHatId = ipToPrettyId(treeId);
  const hatIdHex = prettyIdToId(prettyHatId);
  const treeData = await fetchTreeDetails(treeHex, Number(chainId));
  const hatData = await fetchHatDetails(hatIdHex, Number(chainId));

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
        id: prettyIdToId(tree.id),
        admin: {
          id: tree.linkedToHat?.prettyId,
          prettyId: tree.linkedToHat?.prettyId,
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
      treeData: treeData || null,
      linkedHats: mapWithChainId(linkedHats, chainId) || null,
      hatData: { ...hatData, chainId } || null,
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
