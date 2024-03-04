import { Box, Button, FormControl, Icon, Stack, Text } from '@chakra-ui/react';
import { MUTABILITY } from '@hatsprotocol/constants';
import { useHatForm, useTreeForm } from 'contexts';
import { ImageFile } from 'hats-types';
import { isMutable, isTopHat } from 'hats-utils';
import { usePinImageIpfs } from 'hooks';
import { HatIcon } from 'icons';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFieldArray } from 'react-hook-form';
import { BsImage, BsTextParagraph } from 'react-icons/bs';
import { FaCube, FaHouseUser, FaPlus } from 'react-icons/fa';
import { GrEdit } from 'react-icons/gr';
import {
  DropZone,
  FormRowWrapper,
  Input,
  PlatformInput,
  RadioBox,
  Textarea,
} from 'ui';
import { formatImageUrl } from 'utils';

const MUTABILITY_OPTIONS = [
  { value: MUTABILITY.MUTABLE, label: 'Editable' },
  {
    value: MUTABILITY.IMMUTABLE,
    label: 'Not Editable (cannot be reversed)',
  },
];

const HatBasicsForm = () => {
  const { chainId, selectedHat, treeToDisplay } = useTreeForm();
  const { localForm, formValues, setFormLoading } = useHatForm();
  const [image, setImage] = useState<ImageFile>();
  const { control, setValue } = _.pick(localForm, ['control', 'setValue']);

  const currentImageUrl = _.get(
    _.find(treeToDisplay, ['id', selectedHat?.id]),
    'imageUrl',
  );

  const {
    append: appendGuild,
    fields: fieldsGuilds,
    remove: removeGuild,
  } = useFieldArray({
    control,
    name: 'guilds',
  });

  const {
    append: appendSpace,
    fields: fieldsSpaces,
    remove: removeSpace,
  } = useFieldArray({
    control,
    name: 'spaces',
  });

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
    metadata: { name: `image_${_.toString(chainId)}_hat_${selectedHat?.id}` },
    setLoading: setFormLoading,
  });

  useEffect(() => {
    if (!imagePinData) return;
    const hatImageUrl = formatImageUrl(`ipfs://${imagePinData}`);
    setValue?.('imageUrl', hatImageUrl, { shouldDirty: true });
  }, [imagePinData, setValue]);

  const isNewImage = currentImageUrl !== selectedHat?.imageUrl;

  if (!localForm) return null;

  return (
    <form>
      <FormControl>
        <Stack spacing={8}>
          <FormRowWrapper>
            <Icon as={BsImage} boxSize={4} mt='2px' />
            <Stack w='100%'>
              <Text size='sm' variant='medium'>
                IMAGE
              </Text>
              <DropZone
                getRootProps={getRootProps}
                getInputProps={getInputProps}
                isFocused={isFocused}
                isDragAccept={isDragAccept}
                isDragReject={isDragReject}
                isFullWidth
                image={image}
                imageUrl={currentImageUrl}
                isNewImage={isNewImage}
              />
            </Stack>
          </FormRowWrapper>
          <FormRowWrapper>
            <Icon as={HatIcon} alt='Hat' boxSize={4} mt='2px' />
            <Input
              localForm={localForm}
              name='name'
              label='Hat Name'
              placeholder='Hat name'
            />
          </FormRowWrapper>
          <FormRowWrapper>
            <Icon as={BsTextParagraph} boxSize={4} mt='2px' />
            <Textarea
              localForm={localForm}
              name='description'
              label='Description'
              placeholder='Add a brief description (or a link to one) for this hat'
            />
          </FormRowWrapper>
          {isTopHat(selectedHat) && (
            <FormRowWrapper>
              <FaHouseUser />
              <Stack w='full'>
                <Text size='sm' textTransform='uppercase'>
                  Guilds
                </Text>
                {fieldsGuilds.map((field, index) => (
                  <PlatformInput
                    key={field.id}
                    name={`guilds.${index}`}
                    remove={removeGuild}
                    index={index}
                    fieldsLength={fieldsGuilds.length}
                    type='guild'
                  />
                ))}
                <Box mb={2}>
                  <Button
                    onClick={() => appendGuild('')}
                    isDisabled={_.some(
                      formValues?.guilds,
                      (item: string) => item === '',
                    )}
                    gap={2}
                    variant='outlineMatch'
                    colorScheme='blue.500'
                  >
                    <FaPlus />
                    Add {formValues?.guilds?.length ? 'another' : 'a'} Guild
                  </Button>
                </Box>
              </Stack>
            </FormRowWrapper>
          )}

          {isTopHat(selectedHat) && (
            <FormRowWrapper>
              <Icon as={FaCube} boxSize={4} mt='2px' />
              <Stack w='full'>
                <Text size='sm' textTransform='uppercase'>
                  Snapshot Spaces
                </Text>
                {fieldsSpaces.map((field, index) => (
                  <PlatformInput
                    key={field.id}
                    name={`spaces.${index}`}
                    remove={removeSpace}
                    index={index}
                    fieldsLength={fieldsSpaces.length}
                    type='snapshot'
                  />
                ))}
                <Box mb={2}>
                  <Button
                    onClick={() => appendSpace('')}
                    isDisabled={_.some(
                      formValues?.spaces,
                      (item: string) => item === '',
                    )}
                    gap={2}
                    variant='outlineMatch'
                    colorScheme='blue.500'
                  >
                    <FaPlus />
                    Add {formValues?.spaces?.length ? 'another' : 'a'} Space
                  </Button>
                </Box>
              </Stack>
            </FormRowWrapper>
          )}

          <FormRowWrapper>
            <Icon as={GrEdit} boxSize={4} mt='2px' />
            <Stack spacing={3}>
              <RadioBox
                name='mutable'
                label='EDITABLE'
                isDisabled={!isMutable(selectedHat)}
                subLabel='Should it be possible for an admin to make changes to this hat?'
                localForm={localForm}
                options={MUTABILITY_OPTIONS}
                tooltip='Choose whether the hat should be editable or not'
              />
              {localForm.watch('mutable') === MUTABILITY.IMMUTABLE &&
                !isTopHat(selectedHat) && (
                  <Text color='red.500' size='sm'>
                    Warning: This will make the hat immutable. It can never be
                    changed again. This cannot be undone.
                  </Text>
                )}
            </Stack>
          </FormRowWrapper>
        </Stack>
      </FormControl>
    </form>
  );
};

export default HatBasicsForm;
