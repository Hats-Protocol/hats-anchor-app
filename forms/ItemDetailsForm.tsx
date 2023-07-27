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
import { FaEllipsisV, FaKey, FaPlus } from 'react-icons/fa';

import { DetailsItem } from '@/types';

interface ItemDetailsFormProps {
  items: DetailsItem[];
  setItems: (items: DetailsItem[]) => void;
  handleAddItem: (item: DetailsItem) => void;
  handleRemoveItem: (index: number) => void;
  title: string;
  label: string;
  handleEdit: (index: number, label: string) => void;
}

const ItemDetailsForm = ({
  items,
  setItems,
  handleAddItem,
  handleRemoveItem,
  title,
  label,
  handleEdit,
}: ItemDetailsFormProps) => {
  return (
    <>
      <HStack alignItems='center' ml={-6}>
        <FaKey />
        <Text fontWeight={500}>{title}</Text>
      </HStack>
      {items.map((item, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <Stack key={label + index}>
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
                <MenuItem onClick={() => handleEdit(index, label)}>
                  Edit Link
                </MenuItem>
                <MenuItem onClick={() => handleRemoveItem(index)}>
                  Delete
                </MenuItem>
              </MenuList>
            </Menu>
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
          Add {label}
        </Button>
      </Box>
    </>
  );
};

export default ItemDetailsForm;
