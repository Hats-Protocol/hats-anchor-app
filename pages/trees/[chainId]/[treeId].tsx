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
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
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
import { FaChevronUp, FaChevronDown, FaCopy, FaEdit } from 'react-icons/fa';

import {
  toTreeStructure,
  prettyIdToId,
  decimalToTreeId,
  decimalId,
  urlIdToPrettyId,
  prettyIdToUrlId,
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
import { Data } from '@/components/OrgChart';
import { formatDistanceToNow } from 'date-fns';

const OrgChart = dynamic(() => import('@/components/OrgChart'), { ssr: false });

interface TreeDetailsProps {
  treeId: string;
  chainId: number;
  hatId: string;
  prettyHatId: string;
  treeData: any;
  linkedHatIds: string[];
  hatData: any;
}

const TreeDetails = ({
  treeId,
  chainId,
  hatId,
  prettyHatId,
  treeData,
  linkedHatIds,
  hatData,
}: TreeDetailsProps) => {
  const chain = chainsMap(chainId);
  const [orgChartTree, setOrgChartTree] = useState<Data[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | undefined>(
    undefined,
  );
  const [inactiveHats, setInactiveHats] = useState<boolean>(false);
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
        url={`${CONFIG.url}/trees/${chainId}/${decimalId(
          treeId,
        )}/${prettyIdToUrlId(prettyHatId)}`}
        img={imagesData[hatId]}
      />

      <Layout>
        <Box bg='gray.100' px={5} py={3} mb={5}>
          <Flex justify='space-between' align='center'>
            <Box>
              <Button
                mr={3}
                fontWeight={500}
                border='1px solid #2D3748'
                leftIcon={<FaEdit />}
              >
                Edit Mode
              </Button>
              {/* <Button colorScheme="teal" mr={3}>
                Table View
              </Button> */}
              <Popover isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
                <PopoverTrigger>
                  <Button
                    rightIcon={isOpen ? <FaChevronUp /> : <FaChevronDown />}
                    fontWeight={500}
                    border='1px solid #2D3748'
                  >
                    View Controls
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <PopoverArrow />
                  <PopoverBody>
                    <RadioGroup
                      onChange={setSelectedOption}
                      value={selectedOption}
                    >
                      <Stack direction='column'>
                        <Radio value='Title only'>Title only</Radio>
                        <Radio value='123'>123</Radio>
                        <Radio value='Stats'>Stats</Radio>
                        <Radio value='Wearers'>Wearers</Radio>
                        <Radio value='Permissions'>Permissions</Radio>
                        <Radio value='Responsibilities'>Responsibilities</Radio>
                        <Radio value='Eligibility'>Eligibility</Radio>
                        <Radio value='Toggles'>Toggles</Radio>
                      </Stack>
                    </RadioGroup>
                    <Divider my={4} />
                    <Checkbox
                      isChecked={inactiveHats}
                      onChange={(e) => setInactiveHats(e.target.checked)}
                    >
                      Inactive Hats
                    </Checkbox>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            </Box>
            <VStack align='center' alignItems='flex-end'>
              <Text>
                Contract: {chain?.name}{' '}
                <IconButton
                  aria-label='Copy contract address'
                  icon={<FaCopy />}
                  onClick={() => {
                    // navigator.clipboard.writeText(chain?.contractAddress);
                  }}
                  size='xs'
                  variant='ghost'
                />
              </Text>
              <Text>
                Last event:{' '}
                {`${formatDistanceToNow(
                  new Date(Number(events[0]?.timestamp) * 1000),
                )} ago`}
              </Text>
            </VStack>
          </Flex>
        </Box>

        <OrgChart
          tree={orgChartTree}
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
      prettyHatId: prettyHatId || null,
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
