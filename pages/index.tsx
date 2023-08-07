import {
  Box,
  Button,
  Flex,
  HStack,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react';
import _ from 'lodash';
import { Suspense, useEffect, useState } from 'react';
import { BsDiagram3 } from 'react-icons/bs';
import { FaArrowRight } from 'react-icons/fa';
import { useAccount, useEnsName } from 'wagmi';

import ChakraNextLink from '@/components/atoms/ChakraNextLink';
import Suspender from '@/components/atoms/Suspender';
import DashboardHatCard from '@/components/DashboardHatCard';
import FeaturedDocsCard from '@/components/FeaturedDocsCard';
import FeaturedTreeCard from '@/components/FeaturedTreeCard';
import Layout from '@/components/Layout';
import CONFIG from '@/constants';
import {
  fetchHatDetails,
  fetchManyHatDetails,
  fetchTreeDetails,
} from '@/gql/helpers';
import { fetchTreesById } from '@/hooks/useHatsAdminOf';
import useImageURIs from '@/hooks/useImageURIs';
import useWearerDetails from '@/hooks/useWearerDetails';
import { formatAddress } from '@/lib/general';
import { ipToPrettyId, prettyIdToId, prettyIdToIp } from '@/lib/hats';
import { orderedChains } from '@/lib/web3';
import { ITree } from '@/types';

const featuredDocumentation = [
  {
    url: 'https://docs.hatsprotocol.xyz/',
    name: 'For Hat Wearers',
    description: 'So your DAO gave you a Hat, now what?',
    icon: 'hat',
  },
  {
    url: 'https://docs.hatsprotocol.xyz/getting-started-with-hats',
    name: 'For Governors',
    description:
      'Everything you need to know to get started structuring your organization with hats',
    icon: 'check-square',
  },
  {
    url: 'https://docs.hatsprotocol.xyz/for-developers/hats-protocol-overview',
    name: 'For Chad Hats Dev',
    description:
      'Protocol and SDK documentation for building on top of the open-source protocol',
    icon: 'code',
  },
  {
    url: 'mailto:support@hatsprotocol.xyz',
    name: 'Get in touch!',
    description:
      'Stuck on tree design, deployment, or custom contract development? We’re here to help.',
    icon: 'people',
  },
];

const featuredTemplates = [
  {
    chainId: 5,
    id: 54,
    name: 'Elected Roles',
    description:
      'Delegate roles and authorities automatically based on election results',
    image: `https://indigo-selective-coral-505.mypinata.cloud/ipfs/QmZMzmAKjeEWSbsQsRTKAUHD6u8BbMEdfLSXPviL6Br8na?pinataGatewayToken=M-iEBglWoUCZWJYsihe1IRrngs7HIGeIr3s5lObVw96hv7GTuCw1QrlmnNtwvuXt`,
  },
  {
    chainId: 5,
    id: 55,
    name: 'DAO-controlled Multisig & Signers',
    description:
      'Give and revoke multisig signing authority based on Hat ownerships',
    image: `https://indigo-selective-coral-505.mypinata.cloud/ipfs/bafybeie7nv4u6pd3ryv7goritnmkhvzwdxj2a2en7qaf5bbsntzec5jnea?pinataGatewayToken=M-iEBglWoUCZWJYsihe1IRrngs7HIGeIr3s5lObVw96hv7GTuCw1QrlmnNtwvuXt`,
  },
  {
    chainId: 5,
    id: 56,
    name: 'Permissionless Contribution Levels',
    description:
      'Members can level up and claim new authorities as they increase their reputation in your org',
    image: `https://indigo-selective-coral-505.mypinata.cloud/ipfs/QmWaiWKkRQtZQ5MuNHgYgwk48ubicyf7Ph8f6ZRUuUKmik?pinataGatewayToken=M-iEBglWoUCZWJYsihe1IRrngs7HIGeIr3s5lObVw96hv7GTuCw1QrlmnNtwvuXt`,
  },
];

const featuredTrees = [
  {
    chainId: 10,
    id: 2,
    name: 'Cabin DAO',
    description: 'A DAO for the Cabin community',
    image: `https://indigo-selective-coral-505.mypinata.cloud/ipfs/QmZMzmAKjeEWSbsQsRTKAUHD6u8BbMEdfLSXPviL6Br8na?pinataGatewayToken=M-iEBglWoUCZWJYsihe1IRrngs7HIGeIr3s5lObVw96hv7GTuCw1QrlmnNtwvuXt`,
    avatar:
      'https://indigo-selective-coral-505.mypinata.cloud/ipfs/bafybeibwy623bvifnke6zzisrdw4hpqjy2juhd7lgnrjk6liqpewls2x7q?pinataGatewayToken=M-iEBglWoUCZWJYsihe1IRrngs7HIGeIr3s5lObVw96hv7GTuCw1QrlmnNtwvuXt',
  },
  {
    chainId: 100,
    id: 72,
    name: 'The DIA',
    description: 'A DAO for decentralized curation of intel',
    image: `https://indigo-selective-coral-505.mypinata.cloud/ipfs/bafybeie7nv4u6pd3ryv7goritnmkhvzwdxj2a2en7qaf5bbsntzec5jnea?pinataGatewayToken=M-iEBglWoUCZWJYsihe1IRrngs7HIGeIr3s5lObVw96hv7GTuCw1QrlmnNtwvuXt`,
    avatar:
      'https://indigo-selective-coral-505.mypinata.cloud/ipfs/bafkreicy6iz67k4nutvxs7gtviuxt255k6w2ofxouxi54wrfm5thecg6x4?pinataGatewayToken=M-iEBglWoUCZWJYsihe1IRrngs7HIGeIr3s5lObVw96hv7GTuCw1QrlmnNtwvuXt',
  },
  {
    chainId: 10,
    id: 3,
    name: 'DemoDAO',
    description: 'An exquisite DAO for demo purposes',
    image: `https://indigo-selective-coral-505.mypinata.cloud/ipfs/QmWaiWKkRQtZQ5MuNHgYgwk48ubicyf7Ph8f6ZRUuUKmik?pinataGatewayToken=M-iEBglWoUCZWJYsihe1IRrngs7HIGeIr3s5lObVw96hv7GTuCw1QrlmnNtwvuXt`,
    avatar:
      'https://indigo-selective-coral-505.mypinata.cloud/ipfs/bafybeif7ahzj4tpjglisecg5fqi4a7p5wp7ke2xbr6wg5pefa5l3zt5ulq/?pinataGatewayToken=M-iEBglWoUCZWJYsihe1IRrngs7HIGeIr3s5lObVw96hv7GTuCw1QrlmnNtwvuXt',
  },
];

const Home = () => {
  const { address: wearerAddress } = useAccount();
  const [hatsAndWearers, setHatsAndWearers] = useState<any>([]);

  const { data: currentHats, isLoading: detailsLoading } = useWearerDetails({
    wearerAddress,
    chainId: 'all',
  });

  const { data: currentHatsWithImagesData, isLoading: imagesLoading } =
    useImageURIs(currentHats);

  const sortedHats = _.sortBy(currentHatsWithImagesData, (hat) => {
    return _.indexOf(orderedChains, hat.chainId);
  });

  const { data: ensName } = useEnsName({ address: wearerAddress, chainId: 1 });

  const fetchFeaturedTrees = async () => {
    const trees1 = await fetchTreesById(
      [ipToPrettyId('2'), ipToPrettyId('3')],
      3,
    );
    const tree2 = await fetchTreeDetails(ipToPrettyId('72'), 100);

    const trees = (trees1 || []).concat(tree2 || []) as ITree[];
    const hatsOfTrees = trees.map((tree) => ({
      treeId: prettyIdToIp(tree.id),
      hats: tree.hats.length,
    }));

    const hats1 = await fetchManyHatDetails(
      [prettyIdToId(ipToPrettyId('2')), prettyIdToId(ipToPrettyId('3'))],
      3,
    );
    const hat2 = await fetchHatDetails(prettyIdToId(ipToPrettyId('72')), 100);
    const hats = (hats1 || []).concat(hat2 || []);

    const wearers = hats.map((hat) => ({
      treeId: prettyIdToIp(hat.prettyId),
      wearers: hat.wearers.length,
    }));

    const data = _.map(hatsOfTrees, (tree) => {
      const hat = _.find(wearers, { treeId: tree.treeId });
      return {
        ...tree,
        ...hat,
      };
    });

    setHatsAndWearers(data);
  };

  useEffect(() => {
    fetchFeaturedTrees();
  }, []);

  return (
    <Layout>
      <Box
        w='100%'
        h='100%'
        bg='blue'
        position='fixed'
        opacity={0.07}
        zIndex={-1}
      />
      <Stack spacing={12} px={20} py={120}>
        {wearerAddress ? (
          <Flex justifyContent='space-between'>
            <Stack>
              <Text fontSize={24} fontWeight={500}>
                gm {ensName || formatAddress(wearerAddress)} 👋
              </Text>
              <Text fontSize={18}>
                Here&apos;s what&apos;s happening with your Hats
              </Text>
            </Stack>

            <Box>
              <ChakraNextLink href='/trees/new'>
                <Button colorScheme='blue' py={6} px={8}>
                  <BsDiagram3 />
                  <Text fontSize={18} fontWeight={500} noOfLines={1} ml={3}>
                    Create a new {CONFIG.tree}
                  </Text>
                </Button>
              </ChakraNextLink>
            </Box>
          </Flex>
        ) : (
          <Stack>
            <Text fontSize={24} fontWeight={500}>
              Welcome to Hats Protocol! 🧢
            </Text>
            <Text fontSize={18}>
              Please connect your wallet to get started.
            </Text>
          </Stack>
        )}

        {wearerAddress && (
          <Stack
            spacing={4}
            py={8}
            px={9}
            borderRadius='8px'
            border='1px solid var(--black-alpha-300, rgba(0, 0, 0, 0.16))'
            background='var(--white-alpha-600, rgba(255, 255, 255, 0.48))'
          >
            <Flex justifyContent='space-between' alignItems='center'>
              <Text fontSize={24} fontWeight={500}>
                Your Hats
              </Text>
              {sortedHats.length > 8 && (
                <ChakraNextLink
                  as={ChakraNextLink}
                  href={`/wearers/${wearerAddress}`}
                >
                  <HStack alignItems='center'>
                    <Text>View All of Your Hats</Text> <FaArrowRight />
                  </HStack>
                </ChakraNextLink>
              )}
            </Flex>
            {imagesLoading || detailsLoading ? (
              <Flex justify='center' align='center' pt={10}>
                <Spinner />
              </Flex>
            ) : (
              <SimpleGrid
                columns={{
                  base: 1,
                  sm: 2,
                  md: 3,
                  lg: 4,
                }}
                spacing={6}
              >
                {_.map(sortedHats.slice(0, 8), (hat, i) => (
                  <Suspense fallback={<Suspender />} key={i}>
                    <DashboardHatCard hat={hat} key={i} />
                  </Suspense>
                ))}
              </SimpleGrid>
            )}
          </Stack>
        )}

        <HStack alignItems='start' spacing={12}>
          <Stack spacing={12} flex={1}>
            <Stack
              spacing={4}
              py={8}
              px={9}
              borderRadius='8px'
              border='1px solid var(--black-alpha-300, rgba(0, 0, 0, 0.16))'
              background='var(--white-alpha-600, rgba(255, 255, 255, 0.48))'
            >
              <Text fontSize={24} fontWeight={500}>
                Explore featured trees
              </Text>
              <SimpleGrid columns={3} spacing={6}>
                {_.map(featuredTrees, (tree, i) => (
                  <Suspense key={i} fallback={<Suspender />}>
                    <FeaturedTreeCard
                      treeData={tree}
                      hatsAndWearers={hatsAndWearers.find(
                        (h: { treeId: string }) => Number(h.treeId) === tree.id,
                      )}
                    />
                  </Suspense>
                ))}
              </SimpleGrid>
            </Stack>

            <Stack
              spacing={4}
              py={8}
              px={9}
              borderRadius='8px'
              border='1px solid var(--black-alpha-300, rgba(0, 0, 0, 0.16))'
              background='var(--white-alpha-600, rgba(255, 255, 255, 0.48))'
            >
              <Text fontSize={24} fontWeight={500}>
                Jump right in with a forkable template
              </Text>
              <SimpleGrid columns={3} spacing={6}>
                {_.map(featuredTemplates, (tree, i) => (
                  <FeaturedTreeCard key={i} treeData={tree} />
                ))}
              </SimpleGrid>
            </Stack>
          </Stack>

          <Stack
            spacing={4}
            py={8}
            px={9}
            maxW={500}
            borderRadius='8px'
            border='1px solid var(--black-alpha-300, rgba(0, 0, 0, 0.16))'
            background='var(--white-alpha-600, rgba(255, 255, 255, 0.48))'
          >
            <Text fontSize={24} fontWeight={500}>
              Learn more about Hats
            </Text>
            {_.map(featuredDocumentation, (docsLink, i) => (
              <FeaturedDocsCard key={i} docsData={docsLink} />
            ))}
          </Stack>
        </HStack>
      </Stack>
    </Layout>
  );
};

export default Home;
