import {
  Box,
  Button,
  HStack,
  Icon as IconWrapper,
  Stack,
  Text,
} from '@chakra-ui/react';
import _ from 'lodash';
import { ReactNode, useState } from 'react';
import { useFieldArray } from 'react-hook-form';
import { IconType } from 'react-icons';
import { BsPlusCircle } from 'react-icons/bs';

import LabelWithLink from '@/components/LabelWithLink';
import { useHatForm } from '@/contexts/HatFormContext';
import { useOverlay } from '@/contexts/OverlayContext';
import { DetailsItem } from '@/types';

interface ItemDetailsFormProps {
  formName: string;
  title: string;
  subtitle?: string | ReactNode;
  Icon: IconType;
  label: string;
}

const ItemDetailsForm = ({
  formName,
  title,
  Icon,
  subtitle,
  label,
}: ItemDetailsFormProps) => {
  const { localForm } = useHatForm();
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isLinkValid, setIsLinkValid] = useState(false);
  const [inputLink, setInputLink] = useState('');
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;

  const { watch, control, setValue, getValues } = _.pick(localForm, [
    'watch',
    'control',
    'setValue',
    'getValues',
  ]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: formName,
  });
  const items = watch?.(formName);

  const handleEdit = (index: number) => {
    const itemsArray = getValues?.(formName);
    setInputLink(itemsArray[index].link);
    setCurrentItemIndex(index);
    setModals?.({
      [`editLabel-${title}`]: true,
    });
  };

  const handleSave = () => {
    if (isLinkValid) {
      setValue?.(`${formName}.${currentItemIndex}.link`, inputLink);
      setInputLink('');
      setCurrentItemIndex(0);
    }
    setModals?.({
      [`editLabel-${title}`]: false,
    });
  };

  if (!localForm) return null;

  return (
    <Stack>
      <Box>
        <HStack alignItems='center' ml={-6}>
          {Icon && <IconWrapper as={Icon} boxSize={4} mt='2px' />}
          <Text fontSize='sm' color='blackAlpha.800' fontWeight='medium'>
            {title}
          </Text>
        </HStack>
        {subtitle && typeof subtitle !== 'string' ? (
          subtitle
        ) : (
          <Text color='blackAlpha.700'>{subtitle}</Text>
        )}
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
    </Stack>
  );
};

export default ItemDetailsForm;
