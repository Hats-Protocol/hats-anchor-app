import { Box, Image, Skeleton } from '@chakra-ui/react';
import { HatFormContextProvider, useSelectedHat, useTreeForm } from 'contexts';
import { useMediaStyles } from 'hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { useState } from 'react';

import EditMode from './EditMode';
import TopMenu from './TopMenu';

const BottomMenu = dynamic(() => import('ui').then((mod) => mod.BottomMenu));
const Layout = dynamic(() => import('ui').then((mod) => mod.Layout));
const MainContent = dynamic(() => import('./MainContent'));

const SelectedHatDrawer = ({ returnToList }: SelectedHatDrawerProps) => {
  const [showBottomMenu, setShowBottomMenu] = useState(false);
  const { topHat, editMode, treeToDisplay } = useTreeForm();
  const { selectedHat } = useSelectedHat();
  console.log('hat drawer', selectedHat);
  const selectedHatId = selectedHat?.id;
  const imageUrl = _.get(
    _.find(treeToDisplay, { id: selectedHatId }),
    'imageUrl',
  );
  const { isMobile } = useMediaStyles();

  if (!selectedHat) return null;

  if (isMobile) {
    return (
      <Layout hatData={topHat}>
        <Box h='calc(100vh - 58px)' pt='58px' position='relative'>
          <HatFormContextProvider>
            <TopMenu returnToList={returnToList} />
            {!editMode ? (
              <MainContent
                showBottomMenu={showBottomMenu}
                setShowBottomMenu={setShowBottomMenu}
              />
            ) : (
              <EditMode />
            )}
            <BottomMenu show={showBottomMenu} />
          </HatFormContextProvider>
        </Box>
      </Layout>
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
        <Skeleton isLoaded={!!selectedHat}>
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
            <Image
              loading='lazy'
              src={
                (editMode && imageUrl) ||
                _.get(selectedHat, 'imageUrl') ||
                '/icon.jpeg'
              }
              alt='hat image'
              background='white'
              objectFit='cover'
              h='100%'
            />
          </Box>
        </Skeleton>

        <HatFormContextProvider>
          <TopMenu returnToList={returnToList} />
          {!editMode ? <MainContent /> : <EditMode />}
          <BottomMenu />
        </HatFormContextProvider>
      </Box>
    </Box>
  );
};

export default SelectedHatDrawer;

interface SelectedHatDrawerProps {
  returnToList?: () => void;
}
