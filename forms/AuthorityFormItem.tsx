import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  useDisclosure,
} from '@chakra-ui/react';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UseFormReturn } from 'react-hook-form';
import { BsSave } from 'react-icons/bs';
import { FaRegEdit, FaRegTrashAlt } from 'react-icons/fa';

import DropZone from '@/components/atoms/DropZone';
import Input from '@/components/atoms/Input';
import Textarea from '@/components/atoms/Textarea';
import AuthorityHeader from '@/components/HatDrawer/MainContent/AuthorityHeader';
import { AUTHORITY_TYPES } from '@/constants';
import { useTreeForm } from '@/contexts/TreeFormContext';
import usePinImageIpfs from '@/hooks/usePinImageIpfs';
import { formatImageUrl, validateURL } from '@/lib/general';
import { AuthorityType, ImageFile } from '@/types';

interface AuthoritiesFormItemProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  formName: string;
  index: number;
  id: string;
  remove: (index: number) => void;
}

const AuthoritiesFormItem = ({
  index,
  id,
  formName,
  remove,
  localForm,
}: AuthoritiesFormItemProps) => {
  const [image, setImage] = useState<ImageFile>();
  const { chainId, selectedHat } = useTreeForm();
  const [newImageURI, setNewImageURI] = useState<string>();
  const { setValue } = localForm;
  const { isOpen, onOpen, onClose } = useDisclosure();

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

  const imageUrl = formatImageUrl(image?.preview);
  const imageUrlFormatted = formatImageUrl(newImageURI);

  useEffect(() => {
    if (newImageURI) {
      setValue(`${formName}.${index}.imageUrl`, newImageURI);
    }
  }, [newImageURI, setValue, formName, index]);

  return (
    <Box key={id}>
      <HStack justifyContent='space-between' pt={3} alignItems='center'>
        <Input
          name={`${formName}.${index}.label`}
          localForm={localForm}
          placeholder='Label'
        />
        <IconButton
          onClick={onOpen}
          icon={<FaRegEdit />}
          aria-label='Edit'
          variant='ghost'
          borderColor='blackAlpha.300'
        />
        <IconButton
          onClick={() => remove(index)}
          icon={<FaRegTrashAlt />}
          aria-label='Remove'
          variant='ghost'
          borderColor='blackAlpha.300'
        />
      </HStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent minW='800px' px={3} py={2}>
          <ModalHeader>Edit Authority</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack>
              <Flex w='full' justifyContent='center' mb={8}>
                <Box
                  borderRadius='4px'
                  border='1px solid var(--gray-100, #EDF2F7)'
                  boxShadow='0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.10)'
                  p={3}
                  w='80%'
                >
                  <AuthorityHeader
                    label={localForm.watch(`${formName}.${index}.label`)}
                    type={AUTHORITY_TYPES.social as AuthorityType}
                    imageUrl={localForm.watch(`${formName}.${index}.imageUrl`)}
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
                image={image}
                imageUrl={imageUrl || imageUrlFormatted}
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
    </Box>
  );
};

export default AuthoritiesFormItem;
