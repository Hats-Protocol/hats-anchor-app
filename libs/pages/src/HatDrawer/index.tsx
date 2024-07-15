'use client';

import { Box } from '@chakra-ui/react';
import { HatFormContextProvider, useSelectedHat, useTreeForm } from 'contexts';
import { useMediaStyles } from 'hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { BottomMenu } from 'organisms';
import { useState } from 'react';

import EditMode from './EditMode';
import MainContent from './MainContent';
import TopMenu from './TopMenu';

const LazyImage = dynamic(() => import('ui').then((mod) => mod.LazyImage));

const SelectedHatDrawer = ({ returnToList }: SelectedHatDrawerProps) => {
  const [showBottomMenu, setShowBottomMenu] = useState(false);
  const { editMode, treeToDisplay } = useTreeForm();
  const { selectedHat } = useSelectedHat();
  const selectedHatId = selectedHat?.id;
  const imageUrl = _.get(
    _.find(treeToDisplay, { id: selectedHatId }),
    'imageUrl',
  );
  const { isMobile } = useMediaStyles();

  if (!selectedHat) return null;

  if (isMobile) {
    // TODO are we hitting this case?
    console.log('here in mobile view');
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
        {/* Hat Image */}

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
            src={
              (editMode && imageUrl) ||
              _.get(selectedHat, 'imageUrl') ||
              '/icon.jpeg'
            }
            alt='hat image'
            background='white'
            boxSize='101%'
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
