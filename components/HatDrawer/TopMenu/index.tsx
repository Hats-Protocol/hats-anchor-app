import { Button, Flex, HStack, Icon, Text } from '@chakra-ui/react';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
import { lazy, Suspense } from 'react';
import { BsArrowLeft } from 'react-icons/bs';
import { FiSave } from 'react-icons/fi';
import { IoCloseOutline } from 'react-icons/io5';
import { useAccount } from 'wagmi';

import Suspender from '@/components/atoms/Suspender';
import NetworkSwitcher from '@/components/NetworkSwitcher';
import { useOverlay } from '@/contexts/OverlayContext';
import { useTreeForm } from '@/contexts/TreeFormContext';
import useWearerDetails from '@/hooks/useWearerDetails';
import { isTopHat } from '@/lib/hats';
import { Hat } from '@/types';

import MoreMenu from './MoreMenu';

const Modal = lazy(() => import('@/components/atoms/Modal'));
const HatLinkRequestCreateForm = lazy(
  () => import('@/forms/HatLinkRequestCreateForm'),
);

const TopMenu = ({ onSave, returnToList, isLoading }: TopMenuProps) => {
  const localOverlay = useOverlay();
  const { chainId, editMode, selectedHat, hatDisclosure, setSelectedHatId } =
    useTreeForm();
  const { address } = useAccount();
  const { onClose: onCloseHatDrawer } = _.pick(hatDisclosure, ['onClose']);

  const { data: wearer } = useWearerDetails({
    wearerAddress: address,
    chainId,
  });

  const wearerTopHats = _.map(
    _.filter(
      wearer,
      (hat: Hat) => isTopHat(hat) && hat?.id !== selectedHat?.id,
    ),
    'id',
  );

  const handleReturnToList = () => {
    onSave(false);
    returnToList();
  };

  const handleSave = () => {
    onSave();
  };

  if (!selectedHat) return null;

  return (
    <Flex
      w='100%'
      borderBottom='1px solid'
      borderColor='gray.200'
      h='75px'
      bg='whiteAlpha.900'
      align='center'
      justify={editMode ? 'space-between' : 'flex-end'}
      px={4}
      top={0}
      zIndex={16}
    >
      {editMode && (
        <Button onClick={handleReturnToList} variant='outline'>
          <HStack>
            <Icon as={BsArrowLeft} />
            <Text>{hatIdDecimalToIp(BigInt(selectedHat?.id))}</Text>
          </HStack>
        </Button>
      )}

      <HStack spacing={3} w='full' justifyContent='flex-end'>
        {!editMode && (
          <Button
            onClick={() => {
              setSelectedHatId?.(undefined);
              onCloseHatDrawer?.();
            }}
            leftIcon={<IoCloseOutline />}
            variant='outline'
            aria-label='Close'
            marginRight='auto'
          >
            Close
          </Button>
        )}
        {!editMode && (
          <HStack spacing={3} w='full' justifyContent='flex-end'>
            <NetworkSwitcher />
            <MoreMenu />
          </HStack>
        )}

        {editMode && (
          <Button
            leftIcon={<FiSave />}
            colorScheme='twitter'
            variant='solid'
            onClick={handleSave}
            isLoading={isLoading}
          >
            Save
          </Button>
        )}
      </HStack>

      <Suspense fallback={<Suspender />}>
        <Modal
          name='requestLink'
          title='Request to Link'
          localOverlay={localOverlay}
        >
          <HatLinkRequestCreateForm
            newAdmin={selectedHat.id}
            wearerTopHats={_.filter(
              wearerTopHats,
              (hat) => hat !== selectedHat.admin?.id,
            )}
          />
        </Modal>
      </Suspense>
    </Flex>
  );
};

export default TopMenu;

interface TopMenuProps {
  onSave: (v?: boolean) => void;
  returnToList: () => void;
  isLoading: boolean;
}
