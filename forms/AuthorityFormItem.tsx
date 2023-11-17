import {
  Box,
  Button,
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
import { FaRegEdit, FaRegTrashAlt } from 'react-icons/fa';

import DropZone from '@/components/atoms/DropZone';
import Input from '@/components/atoms/Input';
import Textarea from '@/components/atoms/Textarea';
import { useTreeForm } from '@/contexts/TreeFormContext';
import usePinImageIpfs from '@/hooks/usePinImageIpfs';
import { formatImageUrl, validateURL } from '@/lib/general';
import { ImageFile } from '@/types';

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

  const { data: imagePinData } = usePinImageIpfs({
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
        <ModalContent>
          <ModalHeader>Edit Authority Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack>
              <Input
                name={`${formName}.${index}.label`}
                localForm={localForm}
                placeholder='Label'
              />
              <Input
                name={`${formName}.${index}.link`}
                localForm={localForm}
                placeholder='Action Link'
                options={{
                  validate: (value) => {
                    if (!validateURL(value)) return 'Invalid URL';
                    return true;
                  },
                }}
              />
              <Input
                name={`${formName}.${index}.gate`}
                localForm={localForm}
                placeholder='Gate Link'
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
                placeholder='Enter description (supports markdown)'
              />
              <DropZone
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
              colorScheme='blue'
              mr={3}
              onClick={() => {
                onClose();
                setImage(undefined);
              }}
            >
              Save
            </Button>
            {/* You can add more buttons here if needed */}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AuthoritiesFormItem;
