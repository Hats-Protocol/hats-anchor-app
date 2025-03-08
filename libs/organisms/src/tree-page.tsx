'use client';

import { Modal, SelectedHatContextProvider, useTreeForm } from 'contexts';
import { useMediaStyles } from 'hooks';
import { EventHistory, OrgChart, TreeMenu } from 'molecules';
import { twJoin } from 'tailwind-merge';
import { ScrollArea, Slide } from 'ui';

import { HatDrawer } from './hat-drawer';
import { TreeDrawer } from './tree-drawer';

const TreePage = ({ chainId, treeId }: { chainId: string; treeId: string }) => {
  const {
    // chainId,
    // treeId,
    treeToDisplay,
    // topHatDetails,
    editMode,
    isTreeDrawerOpen,
    returnToTreeList,
    isHatDrawerOpen,
    onCloseHatDrawer,
    onCloseTreeDrawer,
  } = useTreeForm();
  const { isMobile } = useMediaStyles();

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
  //

  return (
    <>
      <SelectedHatContextProvider>
        <Slide
          open={!!treeToDisplay && !!isHatDrawerOpen}
          onClose={onCloseHatDrawer}
          className='max-w-[864px]'
          overlay={isMobile}
          dismissible={isMobile}
        >
          <HatDrawer returnToList={returnToTreeList} />
        </Slide>
      </SelectedHatContextProvider>

      <Slide open={!!isTreeDrawerOpen} onClose={onCloseTreeDrawer} className='max-w-[864px]'>
        <TreeDrawer />
      </Slide>

      <TreeMenu />

      <OrgChart />

      <div className={twJoin('fixed left-0 top-0 z-[-10] h-full w-full', editMode ? 'bg-edit-bg' : 'bg-gray-100')} />

      <Modal name='events' title='Events' size='xl'>
        <ScrollArea className='h-[600px]'>
          <EventHistory type='tree' />
        </ScrollArea>
      </Modal>
    </>
  );
};

export { TreePage };
