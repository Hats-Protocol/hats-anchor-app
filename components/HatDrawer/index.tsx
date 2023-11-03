import { Box, Image } from '@chakra-ui/react';
import _ from 'lodash';
import { useState } from 'react';

import { useTreeForm } from '@/contexts/TreeFormContext';
import useToast from '@/hooks/useToast';
import { FormData } from '@/types';

import BottomMenu from './BottomMenu';
import EditMode from './EditMode';
import MainContent from './MainContent';
import TopMenu from './TopMenu';

const SelectedHatDrawer = ({ returnToList }: SelectedHatDrawerProps) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [unsavedData, setUnsavedData] = useState<Partial<FormData> | undefined>(
    undefined,
  );
  const {
    selectedHat,
    editMode,
    storedData,
    setStoredData,
    newImageUrls,
    removeHat,
    treeDisclosure,
    hatDisclosure,
  } = useTreeForm();
  const newImageUrl = _.find(newImageUrls, [
    'id',
    selectedHat?.id,
  ])?.newImageUrl;
  const selectedHatId = selectedHat?.id;
  const { onOpen: onOpenTreeDrawer } = _.pick(treeDisclosure, ['onOpen']);
  const { onClose: onCloseHatDrawer } = _.pick(hatDisclosure, ['onClose']);

  const handleSave = (sendToast: boolean = true) => {
    if (unsavedData) {
      const updatedHats = _.map(storedData, (hat: Partial<FormData>) =>
        hat.id === selectedHat?.id
          ? { ...unsavedData, id: selectedHat?.id }
          : hat,
      );

      if (!_.find(updatedHats, ['id', selectedHat?.id])) {
        updatedHats.push({ ...unsavedData, id: selectedHat?.id || '0x' });
      }

      setStoredData?.(updatedHats);
      setUnsavedData(undefined);

      if (sendToast) {
        toast.success({
          title: 'Saved',
          description: 'Your changes have been saved.',
          duration: 1500,
        });
      }
    }
  };

  const handleRemoveHat = () => {
    if (!selectedHat) return;
    removeHat?.(selectedHat?.id);
    setUnsavedData(undefined);
  };

  const handleClearChanges = () => {
    if (!selectedHat) return;
    const updateData = _.reject(storedData, { id: selectedHat?.id });
    setStoredData?.(updateData);
    setUnsavedData(undefined);
    onOpenTreeDrawer?.();
    onCloseHatDrawer?.();
  };

  if (!selectedHat) return null;

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
          <Image
            loading='lazy'
            src={
              (editMode && newImageUrl) ||
              _.get(selectedHat, 'imageUrl') ||
              '/icon.jpeg'
            }
            alt='hat image'
            background='white'
            objectFit='cover'
            h='100%'
          />
        </Box>

        <TopMenu
          onSave={handleSave}
          handleRemoveHat={handleRemoveHat}
          handleClearChanges={handleClearChanges}
          returnToList={returnToList}
          isLoading={isLoading}
        />

        {!editMode && <MainContent />}

        {editMode && (
          <EditMode
            setUnsavedData={setUnsavedData}
            unsavedData={unsavedData}
            setIsLoading={setIsLoading}
          />
        )}

        <BottomMenu />
      </Box>
    </Box>
  );
};

export default SelectedHatDrawer;

interface SelectedHatDrawerProps {
  returnToList: () => void;
}
