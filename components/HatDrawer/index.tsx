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
  const { selectedHat, editMode, storedData, setStoredData } = useTreeForm();
  const selectedHatId = selectedHat?.id;

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
        });
      }
    }
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
    >
      <Box w='100%' h='100%' position='relative' zIndex={14}>
        {/* Hat Image */}
        <Image
          loading='lazy'
          src={_.get(selectedHat, 'imageUrl', '/icon.jpeg')}
          alt='hat image'
          position='absolute'
          background='white'
          w='100px'
          h='100px'
          border='3px solid'
          borderColor='gray.700'
          borderRadius='md'
          top='110px'
          left={-81}
          zIndex={16}
        />

        <TopMenu
          onSave={handleSave}
          returnToList={returnToList}
          isLoading={isLoading}
        />

        {!editMode && (
          <MainContent
          // linkRequestFromTree={linkRequestFromTree}
          />
        )}

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
