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
import {
  Modal,
  SelectedHatContextProvider,
  Suspender,
  useOverlay,
  useTreeForm,
} from 'contexts';
import { useSelectedHatDisclosure } from 'hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { NextSeo } from 'next-seo';
import { BsArrowRight } from 'react-icons/bs';
import { chainsMap } from 'utils';
import { Hex, hexToNumber } from 'viem';

import HatDrawer from './HatDrawer';

const ChakraNextLink = dynamic(() =>
  import('ui').then((mod) => mod.ChakraNextLink),
);
const EventHistory = dynamic(() =>
  import('ui').then((mod) => mod.EventHistory),
);
const Layout = dynamic(() => import('ui').then((mod) => mod.Layout));
const OrgChart = dynamic(() => import('ui').then((mod) => mod.OrgChart), {
  ssr: false,
});
const TreeDrawer = dynamic(() => import('./TreeDrawer'), {
  loading: () => <Suspender />,
  ssr: false,
});
const TreeMenu = dynamic(() => import('ui').then((mod) => mod.TreeMenu));

const TreePage = ({
  hatId,
  exists = true,
}: {
  hatId?: Hex;
  exists: boolean;
}) => {
  const localOverlay = useOverlay();
  const {
    chainId,
    treeId,
    treeToDisplay,
    topHatDetails,
    editMode,
    topHat,
    isTreeDrawerOpen,
  } = useTreeForm();
  const { isOpen: isHatDrawerOpen } = useSelectedHatDisclosure(hatId);

  if (!chainId) return null;
  const chain = chainsMap(chainId);

  let title = '';
  if (_.isFinite(_.toNumber(treeId))) {
    title = `Tree #${hexToNumber(treeId)} on ${chain.name}`;
  } else {
    title = 'Invalid Tree ID';
  }
  // TODO finish
  if (topHatDetails) {
    title = `${topHatDetails.name} on ${chain.name}`;
  }
  // } else if (selectedHat) {
  //   if (selectedHatDetails) {
  //     title = `${selectedHatDetails.name} on ${chain.name}`;
  //   } else {
  //     title = `${isTopHat(selectedHat) ? 'Top ' : ''}Hat #${hatIdDecimalToIp(
  //       BigInt(_.get(selectedHat, 'id' || 0)),
  //     )} on ${chain.name}`;
  //   }
  // }

  const returnToTreeList = () => {
    // onOpenTreeDrawer?.();
    // onClose?.();
  };

  return (
    <>
      <NextSeo title={title} />
      <SelectedHatContextProvider
        treeId={treeId}
        chainId={chainId}
        hatId={hatId}
      >
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
