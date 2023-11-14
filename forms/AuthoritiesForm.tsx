import {
  Box,
  Button,
  HStack,
  Icon as IconWrapper,
  Stack,
  Text,
} from '@chakra-ui/react';
import { ReactNode } from 'react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { IconType } from 'react-icons';
import { BsPlusCircle } from 'react-icons/bs';

import { Authority } from '@/types';

import AuthorityFormItem from './AuthorityFormItem';

interface AuthoritiesFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  formName: string;
  title: string;
  subtitle?: string | ReactNode;
  Icon: IconType;
  label: string;
}

const AuthoritiesForm = ({
  localForm,
  formName,
  title,
  Icon,
  subtitle,
  label,
}: AuthoritiesFormProps) => {
  const { watch, control } = localForm;

  const { fields, append, remove } = useFieldArray({
    control,
    name: formName,
  });
  const items = watch(formName);

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
        <AuthorityFormItem
          key={field.id}
          id={field.id}
          index={index}
          formName={formName}
          remove={remove}
          localForm={localForm}
        />
      ))}

      <Box mb={2}>
        <Button
          onClick={() =>
            append({ label: '', description: '', link: '', gate: '' })
          }
          isDisabled={items?.some((item: Authority) => item.label === '')}
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

export default AuthoritiesForm;
