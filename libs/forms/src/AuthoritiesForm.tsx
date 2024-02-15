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
import { usePinImageIpfs } from 'app-hooks';
import { formatImageUrl, getHostnameFromURL } from 'app-utils';
import { useHatForm, useTreeForm } from 'contexts';
import { Authority } from 'hats-types';
import _ from 'lodash';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FieldValues, useFieldArray, useForm } from 'react-hook-form';
import { IconType } from 'react-icons';
import { BsPlusCircle, BsSave } from 'react-icons/bs';
import { AuthorityHeader, DropZone, Input, Textarea } from 'ui';

import AuthoritiesFormItem from './AuthoritiesFormItem';

const AUTHORITY_NAME_LENGTH = 40;

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
  const { localForm: hatForm } = useHatForm();
  const { isOpen, onOpen, onClose } = useDisclosure({
    onClose: () => {
      reset();
      if (item.label === '') remove(index);
    },
  });
  const [index, setIndex] = useState<number>();
  const {
    setValue: hatSetValue,
    getValues: hatGetValues,
    watch: hatWatch,
    control: hatControl,
  } = _.pick(hatForm, ['setValue', 'getValues', 'watch', 'control']);
  const {
    gate,
    link,
    type,
    label: authorityLabel,
    imageUrl,
  } = hatGetValues?.(`${formName}.${index}`) ?? {};
  const localForm = useForm();
  const { setValue, reset, handleSubmit, watch, formState } = _.pick(
    localForm,
    ['setValue', 'reset', 'handleSubmit', 'watch', 'formState'],
  );
  const items = hatWatch?.(formName);
  const item = watch();
  const { errors, isValid } = _.pick(formState, ['errors', 'isValid']);

  const { selectedHatGuildRoles, selectedHatSpaces } = useTreeForm();
  const { fields, append, remove } = useFieldArray({
    control: hatControl,
    name: formName,
  });

  const openEditModal = (i: number) => {
    // const localItem = hatGetValues?.(`${formName}.${i}`);
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

  const saveEditedItem = (values: FieldValues) => {
    hatSetValue?.(`${formName}.${index}`, values);
    onClose();

    reset();
  };

  // append fetched guild roles to form, if they aren't already there
  useEffect(() => {
    const existingLinks = fields.map((field) =>
      'link' in field ? field.link : '',
    );
    const newRoles = _.filter(
      selectedHatGuildRoles,
      (role: Authority) => !_.includes(existingLinks, role.link),
    );
    const newSpaces = _.filter(
      selectedHatSpaces,
      (space: Authority) => !_.includes(existingLinks, space.link),
    );
    if (_.isEmpty(newRoles) && _.isEmpty(newSpaces)) return;

    append(_.concat(newRoles, newSpaces));
  }, [selectedHatGuildRoles, selectedHatSpaces, append, fields]);

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
      name: `image_${_.toString(chainId)}_hat_${selectedHat?.id}_authorities_${
        item.name
      }`,
    },
  });

  useEffect(() => {
    const hatImageURI =
      imagePinData !== undefined ? `ipfs://${imagePinData}` : undefined || '';

    if (hatImageURI !== '') setValue('imageUrl', hatImageURI);
  }, [imagePinData, setValue]);

  const isGate = type === AUTHORITY_TYPES.gate;
  const guildOrSnapshot = useMemo(() => {
    return (
      getHostnameFromURL(gate) === 'guild.xyz' ||
      getHostnameFromURL(link) === 'snapshot.org'
    );
  }, [gate, link]);

  if (!localForm) return null;

  return (
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
                    hideInfo
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
                  placeholder='Enter a description here (supports markdown)'
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
                    <Button
                      colorScheme='gray'
                      color='gray.600'
                      onClick={onClose}
                    >
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
    </Stack>
  );
};

export default AuthoritiesForm;
