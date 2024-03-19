/* eslint-disable no-nested-ternary */
import {
  Button,
  Flex,
  Heading,
  Icon,
  Image,
  Slide,
  Spinner,
  Stack,
} from '@chakra-ui/react';
import { hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import {
  Modal,
  SelectedHatContextProvider,
  Suspender,
  useOverlay,
  useTreeForm,
} from 'contexts';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { NextSeo } from 'next-seo';
import { BsArrowRight } from 'react-icons/bs';
import { chainsMap } from 'utils';

const ChakraNextLink = dynamic(() =>
  import('ui').then((mod) => mod.ChakraNextLink),
);
const EventHistory = dynamic(() =>
  import('ui').then((mod) => mod.EventHistory),
);
const HatDrawer = dynamic(() => import('./HatDrawer'), {
  loading: () => <Suspender />,
});
const Layout = dynamic(() => import('ui').then((mod) => mod.Layout));
const OrgChart = dynamic(() => import('ui').then((mod) => mod.OrgChart));
const TreeDrawer = dynamic(() => import('./TreeDrawer'), {
  loading: () => <Suspender />,
});
const TreeMenu = dynamic(() => import('ui').then((mod) => mod.TreeMenu));

const TreePage = ({ exists = true }: { exists: boolean }) => {
  // const [initialLoad, setInitialLoad] = useState(true);
  // const router = useRouter();
  const localOverlay = useOverlay();
  const { isHatDrawerOpen, isTreeDrawerOpen, returnToTreeList } = localOverlay;
  const { chainId, treeId, treeToDisplay, editMode, topHat } = useTreeForm();

  // useEffect(() => {
  //   const routerHatId = _.get(router, 'query.hatId');
  //   if (initialLoad && !routerHatId && selectedHat && !editMode) {
  //     onOpenHatDrawer?.();
  //     setInitialLoad(false);
  //   }
  // }, [selectedHat, router, onOpenHatDrawer, editMode, initialLoad]);

  if (!chainId) return null;
  const chain = chainsMap(chainId);

  let title = '';
  if (_.isFinite(_.toNumber(treeId))) {
    title = `Tree #${hatIdToTreeId(BigInt(treeId))} on ${chain.name}`;
  } else {
    title = 'Invalid Tree ID';
  }
  // if (!selectedHat && topHatDetails) {
  //   title = `${topHatDetails.name} on ${chain.name}`;
  // } else if (selectedHat) {
  //   console.log(selectedHat);
  //   if (selectedHatDetails) {
  //     title = `${selectedHatDetails.name} on ${chain.name}`;
  //   } else {
  //     title = `${isTopHat(selectedHat) ? 'Top ' : ''}Hat #${hatIdDecimalToIp(
  //       BigInt(_.get(selectedHat, 'id' || 0)),
  //     )} on ${chain.name}`;
  //   }
  // }

  return (
    <>
      <NextSeo title={title} />
      <SelectedHatContextProvider treeId={treeId} chainId={chainId}>
        <Slide
          direction='right'
          in={!!treeToDisplay && !!isHatDrawerOpen}
          style={{
            zIndex: 1000,
            maxWidth: '43%',
            width: '650px',
            display: isHatDrawerOpen ? 'block' : 'none',
          }}
        >
          <HatDrawer returnToList={returnToTreeList} />
        </Slide>
      </SelectedHatContextProvider>

      <Slide
        direction='right'
        in={!!isTreeDrawerOpen}
        style={{ zIndex: 1000, maxWidth: '43%', width: '650px' }}
      >
        <TreeDrawer />
      </Slide>

      <Layout editMode={editMode} hatData={topHat}>
        {exists ? (
          <>
            <TreeMenu />
            {_.isEmpty(treeToDisplay) ? (
              <Flex justify='center' align='center' w='full' h='full'>
                <Spinner />
              </Flex>
            ) : (
              <OrgChart />
            )}
          </>
        ) : (
          <Flex justify='center' align='center' w='full' h='full' pt={20}>
            <Stack spacing={8} align='center'>
              <Heading size='md'>Tree not found!</Heading>
              <Image src='/no-hats.jpg' alt='No hats found' h='600px' />
              <Flex>
                <ChakraNextLink href='/'>
                  <Button
                    variant='outline'
                    rightIcon={<Icon as={BsArrowRight} />}
                  >
                    🧢 Head home
                  </Button>
                </ChakraNextLink>
              </Flex>
            </Stack>
          </Flex>
        )}
      </Layout>

      <Modal
        name='events'
        title='Events'
        size='2xl'
        localOverlay={localOverlay}
      >
        <EventHistory type='tree' />
      </Modal>
    </>
  );
};

export default TreePage;
