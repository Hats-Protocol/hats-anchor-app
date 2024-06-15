'use client';

/* eslint-disable no-nested-ternary */
import { Slide } from '@chakra-ui/react';
import {
  Modal,
  SelectedHatContextProvider,
  Suspender,
  useTreeForm,
} from 'contexts';
import dynamic from 'next/dynamic';
import { chainsMap } from 'utils';
import { Hex } from 'viem';

import HatDrawer from './HatDrawer';

const EventHistory = dynamic(() =>
  import('ui').then((mod) => mod.EventHistory),
);
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
  const {
    chainId,
    treeId,
    treeToDisplay,
    topHatDetails,
    isTreeDrawerOpen,
    returnToTreeList,
    isHatDrawerOpen,
  } = useTreeForm();

  if (!chainId) return null;
  const chain = chainsMap(chainId);

  let title = '';
  if (treeId) {
    title = `Tree #${treeId} on ${chain.name}`;
  } else {
    title = 'Invalid Tree ID';
  }
  // TODO finish
  if (topHatDetails) {
    title = `${topHatDetails.name} on ${chain.name}`;
  }
  console.log('title', title);
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

      <Modal name='events' title='Events' size='2xl'>
        <EventHistory type='tree' />
      </Modal>
    </>
  );
};

export default TreePage;
