import {
  Box,
  Button,
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
import { id } from 'date-fns/locale';
import _ from 'lodash';
import { ReactNode, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFieldArray } from 'react-hook-form';
import { IconType } from 'react-icons';
import { BsPlusCircle, BsSave } from 'react-icons/bs';

import DropZone from '@/components/atoms/DropZone';
import Input from '@/components/atoms/Input';
import Textarea from '@/components/atoms/Textarea';
import AuthorityHeader from '@/components/HatDrawer/MainContent/AuthorityHeader';
import { AUTHORITY_TYPES } from '@/constants';
import { useHatForm } from '@/contexts/HatFormContext';
import { useTreeForm } from '@/contexts/TreeFormContext';
import usePinImageIpfs from '@/hooks/usePinImageIpfs';
import { formatImageUrl, validateURL } from '@/lib/general';
import { Authority, AuthorityType, ImageFile } from '@/types';

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
  const [index, setIndex] = useState<number>();
  const [image, setImage] = useState<ImageFile>();
  const [newImageURI, setNewImageURI] = useState<string>();
  const formattedImageUrl = formatImageUrl(image?.preview);
  const newImageUrl = formatImageUrl(newImageURI);

  const { setValue, getValues } = _.pick(localForm, ['setValue', 'getValues']);
  const {
    imageUrl,
    label: authorityLabel,
    type,
  } = getValues?.(`${formName}.${index}`) ?? {};
  const isToken = type === AUTHORITY_TYPES.token;

  const { watch, control } = _.pick(localForm, ['watch', 'control']);
  const { selectedHatGuildRoles } = useTreeForm();
  const { fields, append, remove } = useFieldArray({
    control,
    name: formName,
  });
  const items = watch?.(formName);

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
    onDrop: (a) => {
      setImage(
        Object.assign(a[0], {
          preview: URL.createObjectURL(a[0]),
        } as ImageFile),
      );
    },
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
    setNewImageURI(hatImageURI);
  }, [imagePinData, setNewImageURI]);

  useEffect(() => {
    if (newImageURI) {
      setValue?.(`${formName}.${index}.imageUrl`, newImageURI);
    }
  }, [newImageURI, setValue, formName, index]);

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
          onOpen={onOpen}
        />
      ))}

      <Box my={2}>
        <Button
          onClick={() => {
            append({ label: '', description: '', link: '', gate: '' });
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
                <Box
                  borderRadius='4px'
                  border='1px solid var(--gray-100, #EDF2F7)'
                  boxShadow='0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.10)'
                  p={3}
                  w='80%'
                >
                  <AuthorityHeader
                    label={authorityLabel}
                    type={
                      (isToken
                        ? AUTHORITY_TYPES.token
                        : AUTHORITY_TYPES.manual) as AuthorityType
                    }
                    imageUrl={imageUrl}
                    hideInfo
                  />
                </Box>
              </Flex>
              <Input
                label='AUTHORITY NAME'
                name={`${formName}.${index}.label`}
                localForm={localForm}
                placeholder='Name'
                options={{
                  required: true,
                }}
              />

              <Input
                label='AUTHORITY LINK'
                name={`${formName}.${index}.link`}
                localForm={localForm}
                placeholder='https://example.com'
                options={{
                  validate: (value) => {
                    if (!validateURL(value)) return 'Invalid URL';
                    return true;
                  },
                }}
                isDisabled={isToken}
              />
              <Input
                label='TOKEN GATE LINK'
                name={`${formName}.${index}.gate`}
                localForm={localForm}
                placeholder='https://example.com'
                options={{
                  validate: (value) => {
                    if (!validateURL(value)) return 'Invalid URL';
                    return true;
                  },
                }}
                isDisabled={isToken}
              />
              <Textarea
                localForm={localForm}
                name={`${formName}.${index}.description`}
                label='Description'
                placeholder='Enter a description here (supports markdown)'
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
                imageUrl={formattedImageUrl || newImageUrl || imageUrl}
              />
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme='gray'
              color='gray.600'
              mr={3}
              onClick={() => {
                onClose();
                setImage(undefined);
              }}
            >
              Cancel
            </Button>
            <Button
              colorScheme='blue'
              leftIcon={<BsSave />}
              isLoading={isLoading}
              onClick={() => {
                onClose();
                setImage(undefined);
              }}
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
