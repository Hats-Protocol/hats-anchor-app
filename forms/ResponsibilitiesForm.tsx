import {
  Box,
  Button,
  HStack,
  Icon as IconWrapper,
  Stack,
  Text,
} from '@chakra-ui/react';
import _ from 'lodash';
import { ReactNode } from 'react';
import { useFieldArray } from 'react-hook-form';
import { IconType } from 'react-icons';
import { BsPlusCircle } from 'react-icons/bs';

import { useHatForm } from '@/contexts/HatFormContext';
import { DetailsItem } from '@/types';

import ResponsibilitiesFormItem from './ResponsibilitiesFormItem';

interface ItemDetailsFormProps {
  formName: string;
  title: string;
  subtitle?: string | ReactNode;
  Icon: IconType;
  label: string;
}

const ResponsibilitiesForm = ({
  formName,
  title,
  Icon,
  subtitle,
  label,
}: ItemDetailsFormProps) => {
  const { localForm } = useHatForm();

  const { watch, control } = _.pick(localForm, ['watch', 'control']);

  const { fields, append, remove } = useFieldArray({
    control,
    name: formName,
  });
  const items = watch?.(formName);

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
        <ResponsibilitiesFormItem
          key={field.id}
          id={field.id}
          index={index}
          formName={formName}
          remove={remove}
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

export default ResponsibilitiesForm;
