import {
  Box,
  Button,
  HStack,
  IconButton,
  Input as ChakraInput,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useState } from 'react';
import { IconType } from 'react-icons';
import { FaEllipsisV, FaPlus } from 'react-icons/fa';

import Modal from '@/components/atoms/Modal';
import { useOverlay } from '@/contexts/OverlayContext';
import { validateURL } from '@/lib/general';
import { DetailsItem } from '@/types';

interface ItemDetailsFormProps {
  items: DetailsItem[];
  setItems: (items: DetailsItem[]) => void;
  handleAddItem: (item: DetailsItem) => void;
  handleRemoveItem: (index: number) => void;
  title: string;
  Icon: IconType;
  label: string;
}

const ItemDetailsForm = ({
  items,
  setItems,
  handleAddItem,
  handleRemoveItem,
  title,
  Icon,
  label,
}: ItemDetailsFormProps) => {
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isLinkValid, setIsLinkValid] = useState(false);
  const [inputLink, setInputLink] = useState('');
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;

  const handleEdit = (index: number) => {
    setInputLink(items[index].link);
    setCurrentItemIndex(index);
    setModals?.({
      [`editLabel-${title}`]: true,
    });
  };

  const handleSave = () => {
    if (isLinkValid) {
      const newArr = [...items];
      newArr[currentItemIndex].link = inputLink;
      setItems(newArr);
      setInputLink('');
      setCurrentItemIndex(0);
    }
    setModals?.({
      [`editLabel-${title}`]: false,
    });
  };

  return (
    <>
      <HStack alignItems='center' ml={-6}>
        {Icon && <Icon />}
        <Text fontSize='sm'>{title}</Text>
      </HStack>
      {items.map((item, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <Stack key={title + index}>
          <HStack alignItems='center' justifyContent='space-between'>
            <ChakraInput
              value={item.label}
              onChange={(e) => {
                const newArr = [...items];
                newArr[index].label = e.target.value;
                setItems(newArr);
              }}
              placeholder='Label'
            />

            <Menu isLazy>
              <MenuButton
                as={IconButton}
                aria-label='Options'
                icon={<FaEllipsisV />}
                variant='outline'
              />
              <MenuList>
                <MenuItem onClick={() => handleEdit(index)}>Edit Link</MenuItem>
                <MenuItem onClick={() => handleRemoveItem(index)}>
                  Delete
                </MenuItem>
              </MenuList>
            </Menu>

            <Modal
              name={`editLabel-${title}`}
              title={`Edit ${title.toLowerCase()} Link`}
              localOverlay={localOverlay}
            >
              <Stack>
                <ChakraInput
                  value={inputLink}
                  onChange={(e) => {
                    setInputLink(e.target.value);
                    setIsLinkValid(validateURL(e.target.value));
                  }}
                  placeholder='https://example.com'
                />
                <HStack justifyContent='end'>
                  <Button
                    colorScheme='blue'
                    mr={3}
                    onClick={handleSave}
                    isDisabled={!isLinkValid}
                  >
                    Ok
                  </Button>
                  <Button
                    variant='ghost'
                    onClick={() =>
                      setModals?.({
                        [`editLabel-${title}`]: false,
                      })
                    }
                  >
                    Cancel
                  </Button>
                </HStack>
              </Stack>
            </Modal>
          </HStack>

          {items[index]?.link && (
            <Text fontSize='sm' color='gray.500'>
              {items[index]?.link}
            </Text>
          )}
        </Stack>
      ))}

      <Box mb={2}>
        <Button
          onClick={() => {
            handleAddItem({ link: '', label: '' });
          }}
          isDisabled={items.some((item) => item.label === '')}
          gap={2}
        >
          <FaPlus />
          Add a {label}
        </Button>
      </Box>
    </>
  );
};

export default ItemDetailsForm;
