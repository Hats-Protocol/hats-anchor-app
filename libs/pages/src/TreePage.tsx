'use client';

import { Slide } from '@chakra-ui/react';
import {
  Modal,
  SelectedHatContextProvider,
  Suspender,
  useTreeForm,
} from 'contexts';
import dynamic from 'next/dynamic';
import { twJoin } from 'tailwind-merge';

import HatDrawer from './HatDrawer';

const EventHistory = dynamic(() =>
  import('molecules').then((mod) => mod.EventHistory),
);
const OrgChart = dynamic(
  () => import('molecules').then((mod) => mod.OrgChart),
  { ssr: false },
);
const TreeDrawer = dynamic(() => import('./TreeDrawer'), {
  loading: () => <Suspender />,
  ssr: false,
});
const TreeMenu = dynamic(() => import('molecules').then((mod) => mod.TreeMenu));

const TreePage = ({
  params: { chainId, treeId },
}: {
  params: { chainId: string; treeId: string };
}) => {
  const {
    // chainId,
    // treeId,
    treeToDisplay,
    // topHatDetails,
    editMode,
    isTreeDrawerOpen,
    returnToTreeList,
    isHatDrawerOpen,
  } = useTreeForm();

  if (!chainId) return null;
  // const chain = chainsMap(chainId);

  // let title = '';
  // if (treeId) {
  //   title = `Tree #${treeId} on ${chain.name}`;
  // } else {
  //   title = 'Invalid Tree ID';
  // }
  // // TODO finish
  // if (topHatDetails) {
  //   title = `${topHatDetails.name} on ${chain.name}`;
  // }
  // console.log('title', title);
  // } else if (selectedHat) {
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
      <SelectedHatContextProvider>
        <Slide
          direction='right'
          in={!!treeToDisplay && !!isHatDrawerOpen}
          style={{
            zIndex: 1000,
            maxWidth: '55%',
            width: '864px',
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

      <TreeMenu />

      <OrgChart />

      <div
        className={twJoin(
          'fixed left-0 top-0 z-[-10] h-full w-full',
          editMode ? 'bg-edit-bg' : 'bg-gray-100',
        )}
      />

      <Modal name='events' title='Events' size='2xl'>
        <EventHistory type='tree' />
      </Modal>
    </>
  );
};

export default TreePage;
