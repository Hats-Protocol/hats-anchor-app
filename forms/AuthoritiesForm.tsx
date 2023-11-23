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
import AuthorityHeader from '@/components/HatDrawer/MainContent/AuthorityHeader';
import { AUTHORITY_TYPES } from '@/constants';
import { useHatForm } from '@/contexts/HatFormContext';
import { useTreeForm } from '@/contexts/TreeFormContext';
import usePinImageIpfs from '@/hooks/usePinImageIpfs';
import { formatImageUrl } from '@/lib/general';
import { Authority, AuthorityType } from '@/types';

import AuthoritiesFormItem from './AuthoritiesFormItem';

interface AuthoritiesFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formName: string;
  title: string;
  subtitle?: string | ReactNode;
  Icon: IconType;
  label: string;
}

const AuthoritiesForm = ({
  formName,
  title,
  Icon,
  subtitle,
  label,
}: AuthoritiesFormProps) => {
  const { chainId, selectedHat } = useTreeForm();
  const { localForm } = useHatForm();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingItem, setEditingItem] = useState<Authority>({} as Authority);
  const [index, setIndex] = useState<number>();
  const { setValue, getValues, watch, control } = _.pick(localForm, [
    'setValue',
    'getValues',
    'watch',
    'control',
  ]);
  const {
    imageUrl,
    label: authorityLabel,
    description,
    link,
    gate,
    type,
  } = getValues?.(`${formName}.${index}`) ?? {};
  const isToken = type === AUTHORITY_TYPES.token;
  const { selectedHatGuildRoles } = useTreeForm();
  const { fields, append, remove } = useFieldArray({
    control,
    name: formName,
  });
  const items = watch?.(formName);

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

  // append fetched guild roles to form, if they aren't already there
  useEffect(() => {
    const existingLinks = fields.map((field) =>
      'link' in field ? field.link : '',
    );
    const newRoles = _.filter(
      selectedHatGuildRoles,
      (role) => !_.includes(existingLinks, role.link),
    );

    if (newRoles.length) {
      append(newRoles);
    }
  }, [selectedHatGuildRoles, append, fields]);

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
      }_authorities_${id}`,
    },
  });

  useEffect(() => {
    const hatImageURI =
      imagePinData !== undefined ? `ipfs://${imagePinData}` : undefined || '';

    if (hatImageURI !== '')
      setEditingItem({ ...editingItem, imageUrl: hatImageURI });
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
        <AuthoritiesFormItem
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
            append({
              label: '',
              description: '',
              link: '',
              gate: '',
              imageUrl: '',
            });
            setIndex(fields.length);
            onOpen();
          }}
          isDisabled={items?.some((item: Authority) => item.label === '')}
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
          <ModalHeader>Edit Authority</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={5}>
              <Flex w='full' justifyContent='center' mb={8}>
                <Card borderRadius='4px' boxShadow='md' p={3} w='80%'>
                  <AuthorityHeader
                    label={authorityLabel}
                    type={
                      (isToken
                        ? AUTHORITY_TYPES.token
                        : AUTHORITY_TYPES.manual) as AuthorityType
                    }
                    imageUrl={editingItem?.imageUrl}
                    hideInfo
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
                  <Text>AUTHORITY NAME</Text>
                </FormLabel>
                <Input
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, label: e.target.value })
                  }
                  defaultValue={authorityLabel}
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
                  <Text>AUTHORITY LINK</Text>
                </FormLabel>
                <Input
                  placeholder='https://example.com'
                  defaultValue={link}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, link: e.target.value })
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
                  <Text>TOKEN GATE LINK</Text>
                </FormLabel>
                <Input
                  placeholder='https://example.com'
                  defaultValue={gate}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, gate: e.target.value })
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

export default AuthoritiesForm;
