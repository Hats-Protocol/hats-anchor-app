import {
  Box,
  Button,
  Card,
  Flex,
  HStack,
  Icon as IconWrapper,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { usePinImageIpfs } from 'app-hooks';
import { formatImageUrl } from 'app-utils';
import { id } from 'date-fns/locale';
import { Authority } from 'hats-types';
import _ from 'lodash';
import { ReactNode, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FieldValues, useFieldArray, useForm } from 'react-hook-form';
import { IconType } from 'react-icons';
import { BsPlusCircle, BsSave } from 'react-icons/bs';
import { DropZone, Input, Textarea } from 'ui';

import ResponsibilityHeader from '../components/HatDrawer/MainContent/ResponsibilityHeader';
import { useHatForm } from '../contexts/HatFormContext';
import { useTreeForm } from '../contexts/TreeFormContext';
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
  const { chainId, selectedHat } = useTreeForm();
  const { localForm: hatForm } = useHatForm();
  const {
    setValue: hatSetValue,
    getValues: hatGetValues,
    watch: hatWatch,
    control: hatControl,
  } = _.pick(hatForm, ['setValue', 'getValues', 'watch', 'control']);
  const [index, setIndex] = useState<number>();
  const {
    imageUrl,
    label: responsibilityLabel,
    link,
  } = hatGetValues?.(`${formName}.${index}`) ?? {};
  const localForm = useForm();
  const { setValue, reset, handleSubmit, watch, formState } = _.pick(
    localForm,
    ['setValue', 'reset', 'handleSubmit', 'watch', 'formState'],
  );
  const items = hatWatch?.(formName);
  const item = watch();
  const { errors, isDirty } = _.pick(formState, ['errors', 'isDirty']);

  const { fields, append, remove } = useFieldArray({
    control: hatControl,
    name: formName,
  });
  const { isOpen, onOpen, onClose } = useDisclosure({
    onClose: () => {
      reset();
      if (item.label === '') remove(index);
    },
  });

  const openEditModal = (i: number) => {
    const {
      imageUrl: localImageUrl,
      label: localLabel,
      description: localDescription,
      link: localLink,
    } = hatGetValues?.(`${formName}.${i}`) ?? {};
    setValue('label', localLabel, { shouldDirty: false });
    setValue('description', localDescription, { shouldDirty: false });
    setValue('link', localLink, { shouldDirty: false });
    setValue('imageUrl', localImageUrl, { shouldDirty: false });
    onOpen();
  };

  const saveEditedItem = (values: FieldValues) => {
    hatSetValue?.(`${formName}.${index}`, values);
    onClose();

    reset();
  };

  const {
    acceptedFiles,
    getRootProps,
    getInputProps,
    isFocused,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    accept: { 'image/*': [] },
  });

  const { data: imagePinData, isLoading } = usePinImageIpfs({
    imageFile: acceptedFiles[0],
    enabled: true,
    metadata: {
      name: `image_${_.toString(chainId)}_hat_${
        selectedHat?.id
      }_responsibilities_${id}`,
    },
  });

  useEffect(() => {
    const hatImageURI =
      imagePinData !== undefined ? `ipfs://${imagePinData}` : undefined || '';

    if (hatImageURI !== '') setValue('imageUrl', hatImageURI);
  }, [imagePinData, setValue]);

  if (!localForm) return null;

  return (
    <Stack>
      <Box mb={3}>
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
      {fields.map((field, i) => (
        <ResponsibilitiesFormItem
          key={field.id}
          index={i}
          formName={formName}
          remove={remove}
          setIndex={setIndex}
          onOpen={() => openEditModal(i)}
        />
      ))}

      <Box my={2}>
        <Button
          onClick={() => {
            append({ link: '', label: '', description: '', imageUrl: '' });
            setIndex(fields.length);
            onOpen();
          }}
          isDisabled={_.some(items, ['label', ''])}
          gap={2}
          variant='outline'
          borderColor='blackAlpha.300'
        >
          <BsPlusCircle />
          Add {items?.length ? 'another' : 'a'} {label}
        </Button>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent minW='800px' px={3} py={2}>
          <ModalHeader>Edit Responsibility</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack
              spacing={4}
              as='form'
              onSubmit={handleSubmit(saveEditedItem)}
            >
              <Flex w='full' justifyContent='center'>
                <Card borderRadius='4px' boxShadow='md' w='80%' p={3}>
                  <ResponsibilityHeader
                    editingItem={item as Authority}
                    label={responsibilityLabel}
                    link={link}
                  />
                </Card>
              </Flex>

              <Input
                label='Responsibility Name'
                name='label'
                placeholder='Name'
                localForm={localForm}
                options={{ required: 'Responsibility name is required' }}
              />

              <Textarea
                label='Description'
                name='description'
                placeholder='Enter a description here (supports markdown)'
                localForm={localForm}
              />

              <Input
                label='Responsibility Link'
                name='link'
                placeholder='https://example.com'
                localForm={localForm}
              />

              <DropZone
                label='Image'
                getRootProps={getRootProps}
                getInputProps={getInputProps}
                isFocused={isFocused}
                isDragAccept={isDragAccept}
                isDragReject={isDragReject}
                isFullWidth
                image={imageUrl}
                imageUrl={formatImageUrl(item?.imageUrl)}
              />

              <Flex mt={6} justify='flex-end'>
                <Button
                  colorScheme='gray'
                  color='gray.600'
                  mr={3}
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme='blue'
                  leftIcon={<BsSave />}
                  isLoading={isLoading}
                  isDisabled={_.some(errors) || !isDirty}
                  type='submit'
                >
                  Save
                </Button>
              </Flex>
            </Stack>
          </ModalBody>
          <ModalFooter />
        </ModalContent>
      </Modal>
    </Stack>
  );
};

export default ResponsibilitiesForm;
