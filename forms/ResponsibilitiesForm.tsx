import {
  Box,
  Button,
  Card,
  Flex,
  FormLabel,
  HStack,
  Icon as IconWrapper,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  Textarea,
  useDisclosure,
} from '@chakra-ui/react';
import { id } from 'date-fns/locale';
import _ from 'lodash';
import { ReactNode, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFieldArray } from 'react-hook-form';
import { IconType } from 'react-icons';
import { BsPlusCircle, BsSave } from 'react-icons/bs';

import DropZone from '@/components/atoms/DropZone';
import ResponsibilityHeader from '@/components/HatDrawer/MainContent/ResponsibilityHeader';
import { useHatForm } from '@/contexts/HatFormContext';
import { useTreeForm } from '@/contexts/TreeFormContext';
import usePinImageIpfs from '@/hooks/usePinImageIpfs';
import { formatImageUrl } from '@/lib/general';
import { Authority, DetailsItem } from '@/types';

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
  const { watch, control, getValues, setValue } = _.pick(localForm, [
    'watch',
    'control',
    'getValues',
    'setValue',
  ]);
  const [index, setIndex] = useState<number>();
  const [editingItem, setEditingItem] = useState<Authority>({} as Authority);
  const { chainId, selectedHat } = useTreeForm();
  const { fields, append, remove } = useFieldArray({
    control,
    name: formName,
  });
  const items = watch?.(formName);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    imageUrl,
    label: responsibilityLabel,
    description,
    link,
  } = getValues?.(`${formName}.${index}`) ?? {};

  const openEditModal = (i: number) => {
    setEditingItem(getValues?.(`${formName}.${i}`));
    onOpen();
  };

  const saveEditedItem = () => {
    if (editingItem) {
      setValue?.(`${formName}.${index}`, editingItem);
      onClose();
      setEditingItem({} as Authority);
    }
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

    if (hatImageURI !== '')
      setEditingItem((localEditingItem) => ({
        ...localEditingItem,
        imageUrl: hatImageURI,
      }));
  }, [imagePinData]);

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
          isDisabled={items?.some((item: DetailsItem) => item.label === '')}
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
            <Stack spacing={5}>
              <Flex w='full' justifyContent='center' mb={8}>
                <Card borderRadius='4px' boxShadow='md' w='80%' p={3}>
                  <ResponsibilityHeader
                    label={responsibilityLabel}
                    link={link}
                    imageUrl={editingItem?.imageUrl}
                  />
                </Card>
              </Flex>
              <Stack>
                <FormLabel
                  m='0'
                  display='contents'
                  alignItems='baseline'
                  fontSize='sm'
                >
                  <Text>RESPONSIBILITY NAME</Text>
                </FormLabel>
                <Input
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, label: e.target.value })
                  }
                  defaultValue={responsibilityLabel}
                  placeholder='Name'
                  required
                />
              </Stack>
              <Stack>
                <FormLabel
                  m='0'
                  display='contents'
                  alignItems='baseline'
                  fontSize='sm'
                >
                  <Text>DESCRIPTION</Text>
                </FormLabel>
                <Textarea
                  placeholder='Enter a description here (supports markdown)'
                  defaultValue={description}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      description: e.target.value,
                    })
                  }
                />
              </Stack>
              <Stack>
                <FormLabel
                  m='0'
                  display='contents'
                  alignItems='baseline'
                  fontSize='sm'
                >
                  <Text>RESPONSIBILITY LINK</Text>
                </FormLabel>
                <Input
                  placeholder='https://example.com'
                  defaultValue={link}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, link: e.target.value })
                  }
                />
              </Stack>
              <DropZone
                label='Image'
                getRootProps={getRootProps}
                getInputProps={getInputProps}
                isFocused={isFocused}
                isDragAccept={isDragAccept}
                isDragReject={isDragReject}
                isFullWidth
                image={imageUrl}
                imageUrl={formatImageUrl(editingItem?.imageUrl)}
              />
            </Stack>
          </ModalBody>
          <ModalFooter>
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
              onClick={saveEditedItem}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Stack>
  );
};

export default ResponsibilitiesForm;
