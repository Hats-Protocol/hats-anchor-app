'use client';

import { hatIdDecimalToIp, hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { HatFormContextProvider, useSelectedHat, useTreeForm } from 'contexts';
import { useMediaStyles } from 'hooks';
import { find, get } from 'lodash';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn, LazyImage } from 'ui';

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

        <MainContent showBottomMenu={showBottomMenu} setShowBottomMenu={setShowBottomMenu} />

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
      <div className='relative z-[14] h-full w-full'>
        <div className='h-100px w-100px border-3px absolute left-[-81px] top-44 z-[16] overflow-hidden rounded-md border-gray-700'>
          <LazyImage
            src={hatImage}
            alt='hat image'
            containerClassName='w-100 h-100'
            skeletonClassName='absolute top-[-2px] left-[-2px]'
          />
        </div>

        {!editMode ? (
          <>
            <TopMenu returnToList={returnToList} />
            <MainContent />
            <BottomMenu />
          </>
        ) : (
          // prefer wrapping like so to avoid rendering context provider when not needed
          <HatFormContextProvider>
            <TopMenu returnToList={returnToList} />
            <EditMode />
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
