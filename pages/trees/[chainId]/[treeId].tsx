import {
  Box,
  Button,
  Checkbox,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  Flex,
  HStack,
  Icon,
  IconButton,
  Image,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Radio,
  RadioGroup,
  Spinner,
  Stack,
  Text,
  VStack,
  useDisclosure,
} from '@chakra-ui/react';
import { formatDistanceToNow } from 'date-fns';
import _ from 'lodash';
import { NextSeo } from 'next-seo';
import dynamic from 'next/dynamic';
import { ReactNode, useEffect, useState } from 'react';
import { BsToggles } from 'react-icons/bs';
import { FaChevronDown, FaChevronUp, FaRegCopy } from 'react-icons/fa';
import { useAccount } from 'wagmi';

import Layout from '@/components/Layout';
import SelectedHatDrawer from '@/components/SelectedHatDrawer';
import CONFIG from '@/constants';
import { fetchHatDetails, fetchTreeDetails } from '@/gql/helpers';
import useImageURIs from '@/hooks/useImageURIs';
import useToast from '@/hooks/useToast';
import useWearerDetails from '@/hooks/useWearerDetails';
import { mapWithChainId } from '@/lib/general';
import {
  decimalId,
  decimalToTreeId,
  isTopHat,
  prettyIdToId,
  prettyIdToIp,
  toTreeStructure,
  urlIdToPrettyId,
} from '@/lib/hats';
import { chainsMap } from '@/lib/web3';
import { HierarchyObject, IHat, IHatData, ITree } from '@/types';

const OrgChart = dynamic(() => import('@/components/OrgChart'), { ssr: false });

interface TreeDetailsProps {
  treeId: string;
  chainId: number;
  hatId: string;
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
  hatId,
  treeData,
  linkedHats,
  hatData,
}: TreeDetailsProps) => {
  const toast = useToast();
  const chain = chainsMap(chainId);
  const [editMode, setEditMode] = useState(false);
  const [orgChartTree, setOrgChartTree] = useState<IHatData[]>([]);
  const [initialHats, setInitialHats] = useState<IHat[] | undefined>(undefined);
  const [hatsData, setHatsData] = useState<IHatData[] | undefined>(undefined);
  const [hierarchyData, setHierarchyData] = useState<HierarchyObject[]>([]);
  const [selectedHatId, setSelectedHatId] = useState<string>(hatId);
  const [selectedOption, setSelectedOption] = useState<string | undefined>(
    'title',
  );

  const [showInactiveHats, setInactiveHats] = useState<boolean>(true);
  const { address } = useAccount();
  const { data: wearerHats } = useWearerDetails({
    wearerAddress: address,
  });
  const { onOpen, onClose, isOpen } = useDisclosure();
  const {
    onOpen: onOpenShade,
    onClose: onCloseShade,
    isOpen: isOpenShade,
  } = useDisclosure();

  // eslint-disable-next-line no-shadow
  const handleSelectHat = (hatId: string) => {
    setSelectedHatId(hatId);
    onOpenShade();
  };

  const events = _.get(treeData, 'events');
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
      console.log(hatsWithImageData);
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

  const fullHatData = _.map(hatsData, (hat: IHat, index: number) => ({
    ...hatsWithImageData?.[index],
    ...hat,
  }));

  return (
    <>
      <NextSeo
        title={title}
        description={`Tree #${decimalId(treeId)} on ${chain?.name}`}
        // openGraph={{
        //   url: `${CONFIG.url}/trees/${chainId}/${treeId}`,
        //   images: [imagesData[hatId]],
        // }}
      />

      <Drawer
        placement='right'
        onClose={() => {
          onCloseShade();
          setEditMode(false);
        }}
        isOpen={isOpenShade}
      >
        <DrawerOverlay />
        <DrawerContent
          maxW='35%'
          background={editMode ? 'cyan.50' : 'whiteAlpha.900'}
        >
          <DrawerBody pt={0}>
            <SelectedHatDrawer
              chainId={chainId}
              selectedHatId={selectedHatId}
              setSelectedHatId={setSelectedHatId}
              hatsData={fullHatData}
              hierarchyData={hierarchyData}
              onClose={onCloseShade}
              editMode={editMode}
              setEditMode={setEditMode}
            />
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
              <Flex align='center' mr={-1.5} gap={1} fontSize='sm'>
                <Text>Contract: </Text>
                <Text fontWeight={500}>{chain?.name}</Text>
                <IconButton
                  aria-label='Copy contract address'
                  icon={<Icon as={FaRegCopy} />}
                  onClick={() => {
                    navigator.clipboard.writeText(CONFIG.hatsAddress);
                    toast.info({
                      title: 'Successfully copied contract address',
                    });
                  }}
                  size='xs'
                  variant='ghost'
                />
              </Flex>
              {!_.isEmpty(events) && (
                <Flex align='center' gap={1} fontSize='sm'>
                  <Text>Last event: </Text>
                  <Text mr={2} fontWeight={500}>
                    {formatDistanceToNow(
                      new Date(Number(events[0]?.timestamp) * 1000),
                    )}{' '}
                    ago
                  </Text>
                  <Image src='/icons/ago.svg' alt='History icon' />
                </Flex>
              )}
            </VStack>
          </Flex>
        </Box>

        {!_.isEmpty(orgChartTree) ? (
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
        ) : (
          <Flex justify='center' align='center' w='full' h='full'>
            <Spinner />
          </Flex>
        )}
      </Layout>
    </>
  );
};

export const getStaticProps = async (context: any) => {
  const { treeId, chainId } = context.params;
  const treeHex = decimalToTreeId(treeId);
  const prettyHatId = urlIdToPrettyId(treeId);
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
      hatId: hatIdHex || null,
      treeData: treeData || null,
      linkedHats: mapWithChainId(linkedHats, chainId) || null,
      hatData: mapWithChainId(hatData, chainId) || null,
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
