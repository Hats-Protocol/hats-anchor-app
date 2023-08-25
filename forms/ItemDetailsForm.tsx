import {
  Box,
  Button,
  HStack,
  Icon as IconWrapper,
  Text,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useFieldArray } from 'react-hook-form';
import { IconType } from 'react-icons';
import { BsPlusCircle } from 'react-icons/bs';

import LabelWithLink from '@/components/LabelWithLink';
import { useOverlay } from '@/contexts/OverlayContext';
import { DetailsItem } from '@/types';

interface ItemDetailsFormProps {
  localForm: any;
  formName: string;
  title: string;
  subtitle?: string;
  Icon: IconType;
  label: string;
}

const ItemDetailsForm = ({
  localForm,
  formName,
  title,
  Icon,
  subtitle,
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
      <Box>
        <HStack alignItems='center' ml={-6}>
          {Icon && <IconWrapper as={Icon} boxSize={4} mt='2px' />}
          <Text fontSize='sm' color='blackAlpha.800' fontWeight='medium'>
            {title}
          </Text>
        </HStack>
        <Text color='blackAlpha.700'>{subtitle}</Text>
      </Box>
      {fields.map((field, index) => (
        <LabelWithLink
          key={field.id}
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
          isDisabled={items?.some((item: DetailsItem) => item.label === '')}
          gap={2}
          variant='outline'
          borderColor='blackAlpha.300'
        >
          <BsPlusCircle />
          Add {items?.length ? 'another' : 'a'} {label}
        </Button>
      </Box>
    </>
  );
};

export default ItemDetailsForm;
