'use client';

import { MUTABILITY } from '@hatsprotocol/constants';
import { useHatForm, useSelectedHat, useTreeForm } from 'contexts';
import { isMutable, isTopHat } from 'hats-utils';
import { usePinImageIpfs } from 'hooks';
import { find, get, pick, some, toString } from 'lodash';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFieldArray } from 'react-hook-form';
import { BsImage, BsTextParagraph } from 'react-icons/bs';
import { FaCube, FaHouseUser, FaPlus } from 'react-icons/fa';
import { GrEdit } from 'react-icons/gr';
import { ImageFile } from 'types';
import { Button, DropZone } from 'ui';
import { formatImageUrl } from 'utils';

import { Form, FormRowWrapper, Input, PlatformInput, RadioBox, Textarea } from './components';

const HatIcon = dynamic(() => import('icons').then((i) => i.HatIcon));

const MUTABILITY_OPTIONS = [
  { value: MUTABILITY.MUTABLE, label: 'Editable' },
  {
    value: MUTABILITY.IMMUTABLE,
    label: 'Not Editable (cannot be reversed)',
  },
];

const HatBasicsForm = () => {
  const { chainId, treeToDisplay } = useTreeForm();
  const { selectedHat } = useSelectedHat();
  const { localForm, formValues, setFormLoading, isLoading: hatFormLoading } = useHatForm();
  const [image, setImage] = useState<ImageFile>();
  const { control, setValue } = pick(localForm, ['control', 'setValue']);

  const currentImageUrl = get(find(treeToDisplay, ['id', selectedHat?.id]), 'imageUrl');

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

  const { acceptedFiles, getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } = useDropzone({
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
    metadata: { name: `image_${toString(chainId)}_hat_${selectedHat?.id}` },
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
    <Form {...localForm}>
      <form>
        <div className='flex flex-col gap-8'>
          <FormRowWrapper noMargin>
            <div className='-ml-7 flex items-center gap-4'>
              <BsImage className='h-4 w-4' />
              <p className='text-sm font-medium uppercase'>Image</p>
            </div>

            <div className='flex w-full flex-col gap-1'>
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
            </div>
          </FormRowWrapper>

          <FormRowWrapper noMargin>
            <HatIcon className='absolute -ml-8 mt-1 size-4' />

            <Input
              name='name'
              label='Hat Name'
              placeholder='Hat name'
              isDisabled={hatFormLoading}
              localForm={localForm}
            />
          </FormRowWrapper>

          <FormRowWrapper noMargin>
            <BsTextParagraph className='absolute -ml-8 mt-1 size-4' />

            <Textarea
              name='description'
              label='Description'
              placeholder='Add a brief description (or a link to one) for this hat'
              className='min-h-20'
              isDisabled={hatFormLoading}
              localForm={localForm}
            />
          </FormRowWrapper>

          {isTopHat(selectedHat) && (
            <FormRowWrapper noMargin>
              <FaHouseUser className='absolute -ml-8 mt-1 size-4' />

              <div className='flex w-full flex-col gap-2'>
                <p className='text-sm font-medium'>Guilds</p>

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

                <div className='mb-2'>
                  <Button
                    onClick={() => appendGuild('')}
                    disabled={some(formValues?.guilds, (item: string) => item === '')}
                    variant='outline'
                    type='button'
                    size='sm'
                  >
                    <FaPlus />
                    Add {formValues?.guilds?.length ? 'another' : 'a'} Guild
                  </Button>
                </div>
              </div>
            </FormRowWrapper>
          )}

          {isTopHat(selectedHat) && (
            <FormRowWrapper noMargin>
              <FaCube className='absolute -ml-8 mt-1 size-4' />

              <div className='flex w-full flex-col gap-2'>
                <p className='text-sm font-medium'>Snapshot Spaces</p>

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

                <div className='mb-2'>
                  <Button
                    onClick={() => appendSpace('')}
                    disabled={some(formValues?.spaces, (item: string) => item === '')}
                    variant='outline'
                    type='button'
                    size='sm'
                  >
                    <FaPlus />
                    Add {formValues?.spaces?.length ? 'another' : 'a'} Space
                  </Button>
                </div>
              </div>
            </FormRowWrapper>
          )}

          <FormRowWrapper noMargin>
            <GrEdit className='absolute -ml-8 mt-1 size-4' />

            <div className='flex w-full flex-col gap-1'>
              <p className='text-sm font-medium'>MUTABILITY</p>

              <RadioBox
                name='mutable'
                label='EDITABLE'
                isDisabled={!isMutable(selectedHat)}
                subLabel='Should it be possible for an admin to make changes to this hat?'
                localForm={localForm}
                options={MUTABILITY_OPTIONS}
                tooltip='Choose whether the hat should be editable or not'
              />
              {localForm.watch('mutable') === MUTABILITY.IMMUTABLE && !isTopHat(selectedHat) && (
                <p className='text-sm text-red-500'>
                  Warning: This will make the hat immutable. It can never be changed again. This cannot be undone.
                </p>
              )}
            </div>
          </FormRowWrapper>
        </div>
      </form>
    </Form>
  );
};

export { HatBasicsForm };
