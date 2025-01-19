'use client';

import {
  Button,
  Card,
  Flex,
  HStack,
  Modal as ChakraModal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
} from '@chakra-ui/react';
import { AUTHORITY_TYPES } from '@hatsprotocol/constants';
import { CONFIG } from '@hatsprotocol/config';
import { usePinImageIpfs } from 'hooks';
import { pick, some } from 'lodash';
import { AuthorityHeader } from 'molecules';
import { useEffect, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import { BsSave } from 'react-icons/bs';
import { Authority } from 'types';
import { DropZone } from 'ui';
import { formatImageUrl, getHostnameFromURL } from 'utils';
import { Hex } from 'viem';

import { Input, Textarea } from '../components';

const AuthoritiesForm = ({
  formName,
  isOpen,
  onClose,
  localForm,
  index,
  hatForm,
  chainId,
  hatId,
}: AuthoritiesFormProps) => {
  const { getValues: hatGetValues, setValue: hatSetValue } = pick(hatForm, ['getValues', 'setValue']);
  const { gate, link, type, label: authorityLabel, imageUrl } = hatGetValues?.(`${formName}.${index}`) ?? {};
  const { setValue, reset, handleSubmit, watch, formState } = pick(localForm, [
    'setValue',
    'reset',
    'handleSubmit',
    'watch',
    'formState',
  ]);
  const item = watch();
  const { errors } = pick(formState, ['errors']);

  const { acceptedFiles, getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } = useDropzone({
    accept: { 'image/*': [] },
  });

  const { data: imagePinData } = usePinImageIpfs({
    imageFile: acceptedFiles[0],
    enabled: true,
    metadata: {
      name: `image_${chainId}_hat_${hatId}_authorities_${item.name}`,
    },
  });

  useEffect(() => {
    const hatImageURI = imagePinData !== undefined ? `ipfs://${imagePinData}` : undefined || '';

    if (hatImageURI && hatImageURI !== '') setValue('imageUrl', hatImageURI);
    // intentionally exclude `setValue`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagePinData]);

  const saveEditedItem = (values: FieldValues) => {
    const combinedValues = {
      ...values,
      type,
      imageUrl: item.imageUrl || imageUrl,
    };
    hatSetValue?.(`${formName}.${index}`, combinedValues);
    onClose();

    reset();
  };

  const isGate = type === AUTHORITY_TYPES.gate;
  const guildOrSnapshot = useMemo(() => {
    return getHostnameFromURL(gate) === 'guild.xyz' || getHostnameFromURL(link) === 'snapshot.org';
  }, [gate, link]);

  return (
    <ChakraModal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent minW='800px' px={3} py={2}>
        <ModalHeader>Edit Authority</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={8}>
            <Flex w='full' justifyContent='center'>
              <Card borderRadius='4px' boxShadow='md' p={4} w='80%'>
                <AuthorityHeader
                  authority={{
                    label: authorityLabel,
                    link,
                    type: isGate ? AUTHORITY_TYPES.gate : AUTHORITY_TYPES.manual,
                    imageUrl,
                  }}
                  editingItem={item as Authority}
                />
              </Card>
            </Flex>

            <Stack as='form' onSubmit={handleSubmit(saveEditedItem)} spacing={4}>
              <Input
                label='Authority Name'
                name='label'
                placeholder='Name'
                localForm={localForm}
                options={{
                  required: 'Authority name is required',
                  maxLength: {
                    value: CONFIG.SHADE_HEADING_LENGTH,
                    message: 'Authority name is too long',
                  },
                }}
              />

              <Input
                label='Authority Link'
                name='link'
                subLabel='The place where action is taken using this authority.'
                placeholder='https://example.com'
                localForm={localForm}
                isDisabled={guildOrSnapshot}
                options={{}}
                // validate: {
                //   mustBeUrl: (v) =>
                //     !v || v === ''
                //       ? true
                //       : v?.match(/^https?:\/\/.+/) || 'Link must be a URL',
                // },
              />

              <Input
                label='Token Gate Link'
                name='gate'
                subLabel='The place where the linkage is created between the hat token and this authority.'
                placeholder='https://example.com'
                localForm={localForm}
                isDisabled={guildOrSnapshot}
              />

              <Textarea
                label='Description'
                name='description'
                placeholder='Enter a description here (supports Markdown)'
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
                image={item?.imageUrl || imageUrl}
                imageUrl={item?.imageUrl ? formatImageUrl(item.imageUrl) : formatImageUrl(imageUrl)}
              />

              <Flex mt={4} justify='flex-end'>
                <HStack>
                  <Button colorScheme='gray' color='gray.600' onClick={onClose}>
                    Cancel
                  </Button>
                  <Button colorScheme='blue' leftIcon={<BsSave />} isDisabled={some(errors)} type='submit'>
                    Save
                  </Button>
                </HStack>
              </Flex>
            </Stack>
          </Stack>
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </ChakraModal>
  );
};

interface AuthoritiesFormProps {
  formName: string;
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  index: number | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hatForm: UseFormReturn<any>;
  chainId: number | undefined;
  hatId: Hex | undefined;
}

export { AuthoritiesForm, type AuthoritiesFormProps };
