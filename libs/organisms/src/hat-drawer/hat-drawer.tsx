'use client';

import { hatIdDecimalToIp, hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { HatFormContextProvider, useSelectedHat, useTreeForm } from 'contexts';
import { useMediaStyles } from 'hooks';
import { find, get } from 'lodash';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn, LazyImage, ScrollArea } from 'ui';

import { BottomMenu } from '../bottom-menu';
import { EditMode } from './edit-mode';
import { MainContent } from './main-content';
import { TopMenu } from './top-menu';

const HatDrawer = ({ returnToList }: SelectedHatDrawerProps) => {
  const [showBottomMenu, setShowBottomMenu] = useState(false);
  const params = useSearchParams();
  const router = useRouter();
  const hatId = params.get('hatId');
  const { editMode, treeToDisplay, treeId, chainId } = useTreeForm();
  const { selectedHat } = useSelectedHat();
  const selectedHatId = selectedHat?.id;
  const imageUrl = get(find(treeToDisplay, { id: selectedHatId }), 'imageUrl');
  const { isMobile } = useMediaStyles();

  if (!selectedHat) return null;

  if (treeId && chainId && selectedHat && !hatId && !isMobile) {
    router.push(`/trees/${chainId}/${treeId}?hatId=${hatIdDecimalToIp(hatIdHexToDecimal(selectedHat.id))}`); // redirect to desktop view
  }

  const hatImage = (editMode && imageUrl) || get(selectedHat, 'imageUrl') || '/icon.jpeg';

  if (isMobile) {
    return (
      <div className='relative h-[calc(100vh-58px)] pt-16'>
        <TopMenu returnToList={returnToList} />

        <ScrollArea className='h-[calc(100vh-180px)]'>
          <MainContent showBottomMenu={showBottomMenu} setShowBottomMenu={setShowBottomMenu} />
        </ScrollArea>

        <BottomMenu show={showBottomMenu} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'z-12 fixed right-0 h-full w-full border-l border-gray-200',
        selectedHatId ? 'block' : 'hidden',
        editMode ? 'bg-cyan-50' : 'bg-whiteAlpha-900',
      )}
    >
      <div className='relative z-[14] flex h-full w-full flex-col'>
        <div className='absolute left-[-81px] top-44 z-[16] h-[100px] w-[100px] overflow-hidden rounded-md border-[3px] border-gray-700'>
          <LazyImage
            src={hatImage}
            alt='hat image'
            containerClassName='w-[100px] h-[100px] -top-1 -left-1'
            skeletonClassName='absolute -top-1 -left-1'
          />
        </div>

        {!editMode ? (
          <>
            <TopMenu returnToList={returnToList} />
            <ScrollArea className='h-[calc(100vh-120px)] flex-1'>
              <MainContent />
            </ScrollArea>
            <BottomMenu />
          </>
        ) : (
          <HatFormContextProvider>
            <TopMenu returnToList={returnToList} />
            <ScrollArea className='h-[calc(100vh-120px)] flex-1'>
              <EditMode />
            </ScrollArea>
            <BottomMenu />
          </HatFormContextProvider>
        )}
      </div>
    </div>
  );
};

export { HatDrawer };

interface SelectedHatDrawerProps {
  returnToList?: () => void;
}
