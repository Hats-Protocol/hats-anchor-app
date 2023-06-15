import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import {
  Box,
  Button,
  Flex,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
  useDisclosure,
  VStack,
  RadioGroup,
  Radio,
  Checkbox,
  Divider,
  Stack,
} from '@chakra-ui/react';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';

import {
  toTreeStructure,
  prettyIdToId,
  decimalToTreeId,
  decimalId,
  urlIdToPrettyId,
  prettyIdToIp,
  isTopHat,
} from '@/lib/hats';
import { chainsMap } from '@/lib/web3';
import Layout from '@/components/Layout';
import { fetchHatDetails, fetchTreeDetails } from '@/gql/helpers';
import useImageURIs from '@/hooks/useImageURIs';
import useWearerDetails from '@/hooks/useWearerDetails';
import HeadComponent from '@/components/HeadComponent';
import CONFIG from '@/constants';
import { HatData } from '@/components/OrgChart';
import { formatDistanceToNow } from 'date-fns';
import {
  Title,
  Stats,
  Wearers,
  Permissions,
  Responsibilities,
  Eligibility,
  Toggles,
  Edit,
  Controls,
  Ago,
  Copy,
  Close,
  Inactive,
} from '@/assets/icons';
import useToast from '@/hooks/useToast';
import SelectedHatShade from '@/components/SelectedHatShade';

const OrgChart = dynamic(() => import('@/components/OrgChart'), { ssr: false });

interface TreeDetailsProps {
  treeId: string;
  chainId: number;
  hatId: string;
  treeData: any;
  linkedHatIds: string[];
  hatData: any;
}

const TreeDetails = ({
  treeId,
  chainId,
  hatId,
  treeData,
  linkedHatIds,
  hatData,
}: TreeDetailsProps) => {
  const toast = useToast();
  const chain = chainsMap(chainId);
  const [orgChartTree, setOrgChartTree] = useState<HatData[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | undefined>(
    undefined,
  );
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [showInactiveHats, setInactiveHats] = useState<boolean>(false);
  const { address } = useAccount();
  const { data: wearerData } = useWearerDetails({
    wearerAddress: address,
    chainId,
  });
  const { onOpen, onClose, isOpen } = useDisclosure();

  const events = _.get(treeData, 'events');
  const title = `${isTopHat(hatData) ? 'Top ' : ''}Hat #${prettyIdToIp(
    _.get(hatData, 'prettyId'),
  )}`;
  const wearerHats = _.map(_.get(wearerData, 'currentHats', []), 'prettyId');
  const { data: imagesData, loading: imagesDataLoading } = useImageURIs(
    treeData?.hats?.map((hat: any) => hat.id).concat(linkedHatIds),
    chainId,
  );

  useEffect(() => {
    const fetchTreeAndSetState = async () => {
      const tree = await toTreeStructure(treeData, imagesData, chainId);
      setOrgChartTree(tree);
    };

    fetchTreeAndSetState();
  }, [treeData, imagesData, chainId]);

  return (
    <>
      <HeadComponent
        title={title}
        description={`Tree #${decimalId(treeId)} on ${chain?.name}`}
        url={`${CONFIG.url}/trees/${chainId}/${decimalId(treeId)}`}
        img={imagesData[hatId]}
      />

      <SelectedHatShade selectedHatId={hatId} chainId={chainId} />
      <Layout>
        <Box bg='gray.100' px={5} py={3} mb={5}>
          <Flex justify='space-between' align='center'>
            <Box>
              <Button
                mr={3}
                fontWeight={500}
                border='1px solid #0987A0'
                background='#C4F1F9'
                color='#065666'
                leftIcon={isEditMode ? <Close /> : <Edit color='#065666' />}
                onClick={() => setIsEditMode(!isEditMode)}
              >
                {isEditMode ? 'Leave Edit Mode' : 'Edit Tree'}
              </Button>
              {/* <Button colorScheme="teal" mr={3}>
                Table View
              </Button> */}
              <Popover isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
                <PopoverTrigger>
                  <Button
                    leftIcon={<Controls fill={isOpen ? 'blue' : '#2D3748'} />}
                    rightIcon={isOpen ? <FaChevronUp /> : <FaChevronDown />}
                    fontWeight={500}
                    border='1px solid #2D3748'
                    color={isOpen ? 'blue.500' : '#2D3748'}
                  >
                    View Controls
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <PopoverArrow />
                  <PopoverBody p={6}>
                    <RadioGroup
                      onChange={setSelectedOption}
                      value={selectedOption}
                    >
                      <Stack direction='column' spacing={3}>
                        <Radio value='titleOnly'>
                          <Flex align='center' gap={2}>
                            <Title />
                            <Text>Title only</Text>
                          </Flex>
                        </Radio>
                        <Radio value='stats'>
                          <Flex align='center' gap={2}>
                            <Stats />
                            <Text>Stats</Text>
                          </Flex>
                        </Radio>
                        <Radio value='wearers'>
                          <Flex align='center' gap={2}>
                            <Wearers />
                            <Text>Wearers</Text>
                          </Flex>
                        </Radio>
                        <Radio value='permissions'>
                          <Flex align='center' gap={2}>
                            <Permissions />
                            <Text>Permissions</Text>
                          </Flex>
                        </Radio>
                        <Radio value='responsibilities'>
                          <Flex align='center' gap={2}>
                            <Responsibilities />
                            <Text>Responsibilities</Text>
                          </Flex>
                        </Radio>
                        <Radio value='eligibility'>
                          <Flex align='center' gap={2}>
                            <Eligibility />
                            <Text>Eligibility</Text>
                          </Flex>
                        </Radio>
                        <Radio value='toggles'>
                          <Flex align='center' gap={2}>
                            <Toggles />
                            <Text>Toggles</Text>
                          </Flex>
                        </Radio>
                      </Stack>
                    </RadioGroup>
                    <Divider my={4} />
                    <Checkbox
                      isChecked={showInactiveHats}
                      onChange={(e) => setInactiveHats(e.target.checked)}
                    >
                      <Flex align='center' gap={2}>
                        <Inactive />
                        Inactive Hats
                      </Flex>
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
                  icon={<Copy />}
                  onClick={() => {
                    navigator.clipboard.writeText(CONFIG.hatsAddress);
                    toast.info({
                      title: 'Succesfully copied contract address',
                    });
                  }}
                  size='xs'
                  variant='ghost'
                />
              </Flex>
              {events?.length > 0 && (
                <Flex align='center' gap={1} fontSize='sm'>
                  <Text>Last event: </Text>
                  <Text mr={2} fontWeight={500}>
                    {formatDistanceToNow(
                      new Date(Number(events[0]?.timestamp) * 1000),
                    )}{' '}
                    ago
                  </Text>
                  <Ago />
                </Flex>
              )}
            </VStack>
          </Flex>
        </Box>

        <OrgChart
          tree={orgChartTree}
          selectedOption={selectedOption}
          showInactiveHats={showInactiveHats}
          isLoading={imagesDataLoading}
          wearerHats={wearerHats}
          chainId={chainId}
          setSelectedNode={setSelectedNode}
          selectedNode={selectedNode}
        />
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
  const linkedHatIds = [];
  if (linkedToHat?.id) {
    linkedHatIds.push(linkedToHat.id);
  }
  if (parentOfTrees) {
    linkedHatIds.push(
      ...parentOfTrees.map((tree: any) => prettyIdToId(tree.id)),
    );
  }

  return {
    props: {
      treeId: treeHex || null,
      chainId: _.toNumber(chainId),
      hatId: hatIdHex || null,
      treeData: treeData || null,
      linkedHatIds,
      hatData: hatData || null,
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
