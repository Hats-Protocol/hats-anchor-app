'use client';

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
import { AUTHORITY_TYPES, CONFIG } from '@hatsprotocol/constants';
import { useHatForm, useSelectedHat, useTreeForm } from 'contexts';
import { usePinImageIpfs } from 'hooks';
import { pick, some } from 'lodash';
import { AuthorityHeader } from 'molecules';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  FieldValues,
  useFieldArray,
  useForm,
  UseFormReturn,
} from 'react-hook-form';
import { IconType } from 'react-icons';
import { BsPlusCircle, BsSave } from 'react-icons/bs';
import { Authority } from 'types';
import { DropZone } from 'ui';
import { formatImageUrl, getHostnameFromURL } from 'utils';
import { Hex } from 'viem';

import AuthoritiesFormItem from './AuthoritiesFormItem';
import { Input, Textarea } from './components';

const Safe = dynamic(() => import('icons').then((mod) => mod.Safe));

interface AuthoritiesFormListProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formName: string;
  title: string;
  subtitle?: string | ReactNode;
  Icon: IconType;
  label: string;
}

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
  const { getValues: hatGetValues, setValue: hatSetValue } = pick(hatForm, [
    'getValues',
    'setValue',
  ]);
  const {
    gate,
    link,
    type,
    label: authorityLabel,
    imageUrl,
  } = hatGetValues?.(`${formName}.${index}`) ?? {};
  const { setValue, reset, handleSubmit, watch, formState } = pick(localForm, [
    'setValue',
    'reset',
    'handleSubmit',
    'watch',
    'formState',
  ]);
  const item = watch();
  const { errors } = pick(formState, ['errors']);

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

  const { data: imagePinData } = usePinImageIpfs({
    imageFile: acceptedFiles[0],
    enabled: true,
    metadata: {
      name: `image_${chainId}_hat_${hatId}_authorities_${item.name}`,
    },
  });

  useEffect(() => {
    const hatImageURI =
      imagePinData !== undefined ? `ipfs://${imagePinData}` : undefined || '';

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
    return (
      getHostnameFromURL(gate) === 'guild.xyz' ||
      getHostnameFromURL(link) === 'snapshot.org'
    );
  }, [gate, link]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
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
                    type: isGate
                      ? AUTHORITY_TYPES.gate
                      : AUTHORITY_TYPES.manual,
                    imageUrl,
                  }}
                  editingItem={item as Authority}
                />
              </Card>
            </Flex>

            <Stack
              as='form'
              onSubmit={handleSubmit(saveEditedItem)}
              spacing={4}
            >
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
                options={{
                  required: false,
                  validate: (v) =>
                    !v
                      ? true
                      : v?.match(/^https?:\/\/.+/) || 'Link must be a URL',
                }}
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
                imageUrl={
                  item?.imageUrl
                    ? formatImageUrl(item.imageUrl)
                    : formatImageUrl(imageUrl)
                }
              />

              <Flex mt={4} justify='flex-end'>
                <HStack>
                  <Button colorScheme='gray' color='gray.600' onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    colorScheme='blue'
                    leftIcon={<BsSave />}
                    isDisabled={some(errors)}
                    type='submit'
                  >
                    Save
                  </Button>
                </HStack>
              </Flex>
            </Stack>
          </Stack>
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  );
};

const AuthoritiesFormList = ({
  formName,
  title,
  Icon,
  subtitle,
  label,
}: AuthoritiesFormListProps) => {
  // CONTEXTS
  const { chainId } = useTreeForm();
  const { selectedHat } = useSelectedHat();
  const { localForm: hatForm } = useHatForm();
  // LOCAL STATE
  const [editingIndex, setEditingIndex] = useState<number>();

  // MODAL DISCLOSURE
  const { isOpen, onOpen, onClose } = useDisclosure({
    onClose: () => {
      reset();
      if (item.label === '') remove(editingIndex);
    },
  });

  // FORMS
  const {
    getValues: hatGetValues,
    watch: hatWatch,
    control: hatControl,
  } = pick(hatForm, ['getValues', 'watch', 'control']);
  const localForm = useForm();
  const { setValue, reset, watch } = pick(localForm, [
    'setValue',
    'reset',
    'handleSubmit',
    'watch',
  ]);
  const items = hatWatch?.(formName);
  const item = watch();

  const { fields, append, remove } = useFieldArray({
    control: hatControl,
    name: formName,
  });

  // ACTIONS
  const openEditModal = (i: number) => {
    const {
      imageUrl: localImageUrl,
      label: localLabel,
      description: localDescription,
      link: localLink,
      gate: localGate,
    } = hatGetValues?.(`${formName}.${i}`) ?? {};
    setValue('label', localLabel, { shouldDirty: false });
    setValue('description', localDescription, { shouldDirty: false });
    setValue('link', localLink, { shouldDirty: false });
    setValue('gate', localGate, { shouldDirty: false });
    setValue('imageUrl', localImageUrl, { shouldDirty: false });
    onOpen();
  };

  if (!localForm || !hatForm) return null;

  return (
    <>
      <Stack>
        <Box mb={3}>
          <HStack alignItems='center' ml={-6}>
            {Icon && <IconWrapper as={Icon} boxSize={4} mt='2px' />}
            <Text size='sm' variant='lightMedium'>
              {title}
            </Text>
          </HStack>
          {subtitle && typeof subtitle !== 'string' ? (
            subtitle
          ) : (
            <Text variant='gray'>{subtitle}</Text>
          )}
        </Box>
        {fields.map((field, i) => (
          <AuthoritiesFormItem
            key={field.id}
            index={i}
            formName={formName}
            remove={remove}
            setIndex={setEditingIndex}
            onOpen={() => openEditModal(i)}
          />
        ))}

        <Box my={2}>
          <HStack>
            <Button
              onClick={() => {
                append({
                  label: '',
                  description: '',
                  link: '',
                  gate: '',
                  imageUrl: '',
                });
                setEditingIndex(fields.length);
                onOpen();
              }}
              isDisabled={some(items, ['label', ''])}
              variant='outline'
              borderColor='blackAlpha.300'
              leftIcon={<IconWrapper as={BsPlusCircle} />}
            >
              Add {items?.length ? 'another' : 'an'} {label}
            </Button>
            {/* temporary button until interim form and edit mode v2 */}
            <Link
              href='https://hats-signer-gate-portal.vercel.app/deploy'
              passHref
            >
              <Button variant='outline' leftIcon={<IconWrapper as={Safe} />}>
                Add a Safe
              </Button>
            </Link>
          </HStack>
        </Box>
      </Stack>

      <AuthoritiesForm
        formName={formName}
        isOpen={isOpen}
        onClose={onClose}
        index={editingIndex}
        localForm={localForm}
        hatForm={hatForm}
        chainId={chainId}
        hatId={selectedHat?.id}
      />
    </>
  );
};

export default AuthoritiesFormList;
