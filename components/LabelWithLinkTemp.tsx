import {
  Button,
  HStack,
  IconButton,
  Input as ChakraInput,
  Stack,
  Text,
} from '@chakra-ui/react';
import { FaLink, FaRegTrashAlt } from 'react-icons/fa';

import Modal from '@/components/atoms/Modal';
import LinkInput from '@/components/LinkInput';
import { useOverlay } from '@/contexts/OverlayContext';
import { DetailsItem } from '@/types';

interface LabelWithLinkProps {
  item: DetailsItem;
  title: string;
  handleRemoveItem: () => void;
  onChangeLabel: (e: any) => void;
  handleEdit: () => void;
  handleSave: () => void;
  inputLink: string;
  setInputLink: (inputLink: string) => void;
  isLinkValid: boolean;
  setIsLinkValid: (isLinkValid: boolean) => void;
}

const LabelWithLinkTemp = ({
  item,
  title,
  handleRemoveItem,
  onChangeLabel,
  handleEdit,
  handleSave,
  inputLink,
  setInputLink,
  isLinkValid,
  setIsLinkValid,
}: LabelWithLinkProps) => {
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;

  return (
    <Stack>
      <HStack alignItems='center' justifyContent='space-between'>
        <ChakraInput
          value={item.label}
          onChange={onChangeLabel}
          placeholder='Label'
        />

        <Button leftIcon={<FaLink />} onClick={handleEdit} px={10}>
          {item.link ? 'Edit' : 'Add'} Link
        </Button>
        <IconButton
          onClick={handleRemoveItem}
          icon={<FaRegTrashAlt />}
          aria-label='Remove'
        />

        <Modal
          name={`editLabel-${title}`}
          title={`Edit ${title.toLowerCase()} Link`}
          localOverlay={localOverlay}
        >
          <LinkInput
            inputLink={inputLink}
            setInputLink={setInputLink}
            isLinkValid={isLinkValid}
            setIsLinkValid={setIsLinkValid}
            handleSave={handleSave}
            title={title}
            setModals={setModals}
          />
        </Modal>
      </HStack>

      {item.link && (
        <Text fontSize='sm' color='gray.500'>
          {item.link}
        </Text>
      )}
    </Stack>
  );
};

export default LabelWithLinkTemp;
