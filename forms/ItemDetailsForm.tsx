import { Box, Button, HStack, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { useFieldArray } from 'react-hook-form';
import { IconType } from 'react-icons';
import { FaPlus } from 'react-icons/fa';

import LabelWithLink from '@/components/LabelWithLink';
import { useOverlay } from '@/contexts/OverlayContext';
import { DetailsItem } from '@/types';

interface ItemDetailsFormProps {
  localForm: any;
  formName: string;
  title: string;
  Icon: IconType;
  label: string;
}

const ItemDetailsForm = ({
  localForm,
  formName,
  title,
  Icon,
  label,
}: ItemDetailsFormProps) => {
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isLinkValid, setIsLinkValid] = useState(false);
  const [inputLink, setInputLink] = useState('');
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;

  const { watch, control, setValue, getValues } = localForm;

  const { fields, append, remove } = useFieldArray({
    control,
    name: formName,
  });
  const items = watch(formName);

  const handleEdit = (index: number) => {
    const itemsArray = getValues(formName);
    setInputLink(itemsArray[index].link);
    setCurrentItemIndex(index);
    setModals?.({
      [`editLabel-${title}`]: true,
    });
  };

  const handleSave = () => {
    if (isLinkValid) {
      setValue(`${formName}.${currentItemIndex}.link`, inputLink);
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
      {fields.map((field, index) => (
        <LabelWithLink
          key={field.id}
          index={index}
          localForm={localForm}
          title={title}
          handleRemoveItem={() => remove(index)}
          handleEdit={() => handleEdit(index)}
          handleSave={handleSave}
          inputLink={inputLink}
          setInputLink={setInputLink}
          isLinkValid={isLinkValid}
          setIsLinkValid={setIsLinkValid}
          labelName={`${formName}.${index}.label`}
          linkName={`${formName}.${index}.link`}
        />
      ))}

      <Box mb={2}>
        <Button
          onClick={() => append({ link: '', label: '' })}
          isDisabled={items.some((item: DetailsItem) => item.label === '')}
          gap={2}
        >
          <FaPlus />
          Add {fields.length ? 'another' : 'a'} {label}
        </Button>
      </Box>
    </>
  );
};

export default ItemDetailsForm;
