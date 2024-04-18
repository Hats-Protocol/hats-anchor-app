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
import { AUTHORITY_TYPES } from '@hatsprotocol/constants';
import { useHatForm, useSelectedHat, useTreeForm } from 'contexts';
import { usePinImageIpfs } from 'hooks';
import _ from 'lodash';
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
import { AuthorityHeader, DropZone, Input, Textarea } from 'ui';
import { formatImageUrl, getHostnameFromURL } from 'utils';
import { Hex } from 'viem';

import AuthoritiesFormItem from './AuthoritiesFormItem';

const AUTHORITY_NAME_LENGTH = 40;

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
  const { getValues: hatGetValues, setValue: hatSetValue } = _.pick(hatForm, [
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
  const { setValue, reset, handleSubmit, watch, formState } = _.pick(
    localForm,
    ['setValue', 'reset', 'handleSubmit', 'watch', 'formState'],
  );
  const item = watch();
  const { errors, isValid } = _.pick(formState, ['errors', 'isValid']);

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
      name: `image_${_.toString(chainId)}_hat_${hatId}_authorities_${
        item.name
      }`,
    },
  });

  useEffect(() => {
    const hatImageURI =
      imagePinData !== undefined ? `ipfs://${imagePinData}` : undefined || '';

    if (hatImageURI !== '') setValue('imageUrl', hatImageURI);
    // intentionally exclude `setValue`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagePinData]);

  const saveEditedItem = (values: FieldValues) => {
    const combinedValues = {
      ...values,
      type,
      imageUrl,
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
                    value: AUTHORITY_NAME_LENGTH,
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
                options={{ required: 'Authority link is required' }}
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
                image={imageUrl}
                imageUrl={formatImageUrl(imageUrl)}
              />

              <Flex mt={4} justify='flex-end'>
                <HStack>
                  <Button colorScheme='gray' color='gray.600' onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    colorScheme='blue'
                    leftIcon={<BsSave />}
                    isLoading={isLoading}
                    isDisabled={_.some(errors) || !isValid}
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
  } = _.pick(hatForm, ['getValues', 'watch', 'control']);
  const localForm = useForm();
  const { setValue, reset, watch } = _.pick(localForm, [
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
            isDisabled={_.some(items, ['label', ''])}
            gap={2}
            variant='outline'
            borderColor='blackAlpha.300'
          >
            <BsPlusCircle />
            Add {items?.length ? 'another' : 'a'} {label}
          </Button>
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
