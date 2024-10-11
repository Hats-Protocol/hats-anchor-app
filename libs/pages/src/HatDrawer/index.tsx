'use client';

import { Box } from '@chakra-ui/react';
import { hatIdDecimalToIp, hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { HatFormContextProvider, useSelectedHat, useTreeForm } from 'contexts';
import { useMediaStyles } from 'hooks';
import { find, get } from 'lodash';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { BottomMenu } from 'organisms';
import { useState } from 'react';

import EditMode from './EditMode';
import MainContent from './MainContent';
import TopMenu from './TopMenu';

const LazyImage = dynamic(() => import('ui').then((mod) => mod.LazyImage));

const SelectedHatDrawer = ({ returnToList }: SelectedHatDrawerProps) => {
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
    router.push(
      `/trees/${chainId}/${treeId}?hatId=${hatIdDecimalToIp(
        hatIdHexToDecimal(selectedHat.id),
      )}`,
    ); // redirect to desktop view
  }

  const hatImage =
    (editMode && imageUrl) || get(selectedHat, 'imageUrl') || '/icon.jpeg';

  if (isMobile) {
    return (
      <Box h='calc(100vh - 58px)' pt='58px' position='relative'>
        <TopMenu returnToList={returnToList} />

        <MainContent
          showBottomMenu={showBottomMenu}
          setShowBottomMenu={setShowBottomMenu}
        />

        <BottomMenu show={showBottomMenu} />
      </Box>
    );
  }

  return (
    <Box
      w='full'
      h='100%'
      borderLeft='1px solid'
      borderColor='gray.200'
      position='fixed'
      display={selectedHatId ? 'block' : 'none'}
      right={0}
      zIndex={12}
      background={editMode ? 'cyan.50' : 'whiteAlpha.900'}
    >
      <Box w='100%' h='100%' position='relative' zIndex={14}>
        <Box
          position='absolute'
          h='100px'
          w='100px'
          overflow='hidden'
          border='3px solid'
          borderColor='gray.700'
          borderRadius='md'
          top='110px'
          left={-81}
          zIndex={16}
        >
          <LazyImage
            src={hatImage}
            alt='hat image'
            boxSize={100}
            skeletonProps={{ position: 'absolute', top: '-2px', left: '-2px' }}
          />
        </Box>

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
      </Box>
    </Box>
  );
};

export default SelectedHatDrawer;

interface SelectedHatDrawerProps {
  returnToList?: () => void;
}
