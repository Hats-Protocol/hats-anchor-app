import { Box, Button, HStack, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { IconType } from 'react-icons';
import { FaPlus } from 'react-icons/fa';

import LabelWithLink from '@/components/LabelWithLink';
import { useOverlay } from '@/contexts/OverlayContext';
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

  const onChangeLabel = (e: any, index: number) => {
    const newArr = [...items];
    newArr[index].label = e.target.value;
    setItems(newArr);
  };

  return (
    <>
      <HStack alignItems='center' ml={-6}>
        {Icon && <Icon />}
        <Text fontSize='sm'>{title}</Text>
      </HStack>
      {items.map((item, index) => (
        <LabelWithLink
          // eslint-disable-next-line react/no-array-index-key
          key={title + index}
          item={item}
          title={title}
          handleRemoveItem={() => handleRemoveItem(index)}
          onChangeLabel={(e) => onChangeLabel(e, index)}
          handleEdit={() => handleEdit(index)}
          handleSave={handleSave}
          inputLink={inputLink}
          setInputLink={setInputLink}
          isLinkValid={isLinkValid}
          setIsLinkValid={setIsLinkValid}
        />
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
