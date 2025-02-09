'use client';

import { CONFIG } from '@hatsprotocol/config';
import { Modal, useHatForm, useOverlay, useSelectedHat, useTreeForm } from 'contexts';
import { usePinImageIpfs } from 'hooks';
import { pick, some, toString } from 'lodash';
import { ResponsibilityHeader } from 'molecules';
import { ReactNode, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FieldValues, useFieldArray, useForm } from 'react-hook-form';
import { IconType } from 'react-icons';
import { BsPlusCircle, BsSave } from 'react-icons/bs';
import { Authority } from 'types';
import { Button, Card, DropZone } from 'ui';
import { formatImageUrl } from 'utils';

import { Form, Input, Textarea } from './components';
import { ResponsibilitiesFormItem } from './responsibilities-form-item';

interface ItemDetailsFormProps {
  formName: string;
  title: string;
  subtitle?: string | ReactNode;
  Icon: IconType;
  label: string;
}

const ResponsibilitiesForm = ({ formName, title, Icon, subtitle, label }: ItemDetailsFormProps) => {
  const { chainId } = useTreeForm();
  const { selectedHat } = useSelectedHat();
  const { localForm: hatForm } = useHatForm();
  const { setModals } = useOverlay();
  const {
    setValue: hatSetValue,
    getValues: hatGetValues,
    watch: hatWatch,
    control: hatControl,
  } = pick(hatForm, ['setValue', 'getValues', 'watch', 'control']);
  const [index, setIndex] = useState<number>();
  const { imageUrl, label: responsibilityLabel, link } = hatGetValues?.(`${formName}.${index}`) ?? {};
  const localForm = useForm();
  const { setValue, reset, handleSubmit, watch, formState } = pick(localForm, [
    'setValue',
    'reset',
    'handleSubmit',
    'watch',
    'formState',
  ]);
  const items = hatWatch?.(formName);
  const item = watch();
  const { errors, isDirty } = pick(formState, ['errors', 'isDirty']);

  const { fields, append, remove } = useFieldArray({
    control: hatControl,
    name: formName,
  });

  const openEditModal = (i: number) => {
    const {
      imageUrl: localImageUrl,
      label: localLabel,
      description: localDescription,
      link: localLink,
    } = hatGetValues?.(`${formName}.${i}`) ?? {};
    setValue('label', localLabel, { shouldDirty: false });
    setValue('description', localDescription, { shouldDirty: false });
    setValue('link', localLink, { shouldDirty: false });
    setValue('imageUrl', localImageUrl, { shouldDirty: false });
    setModals?.({ 'responsibilities-edit': true });
  };

  const saveEditedItem = (values: FieldValues) => {
    hatSetValue?.(`${formName}.${index}`, values);
    setModals?.({});

    reset();
  };

  const { acceptedFiles, getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } = useDropzone({
    accept: { 'image/*': [] },
  });

  const { data: imagePinData } = usePinImageIpfs({
    imageFile: acceptedFiles[0],
    enabled: true,
    metadata: {
      name: `image_${toString(chainId)}_hat_${selectedHat?.id}_responsibilities_${index}`,
    },
  });

  useEffect(() => {
    const hatImageURI = imagePinData !== undefined ? `ipfs://${imagePinData}` : undefined || '';

    if (hatImageURI !== '') setValue('imageUrl', hatImageURI);
  }, [imagePinData, setValue]);

  if (!localForm) return null;

  return (
    <div className='flex flex-col gap-2'>
      <div className='mb-2 space-y-1'>
        <div className='-ml-7 flex items-center gap-3'>
          {Icon && <Icon className='size-4' />}
          <p className='text-sm font-medium'>{title}</p>
        </div>

        {subtitle && typeof subtitle !== 'string' ? subtitle : <p className='text-sm text-gray-500'>{subtitle}</p>}
      </div>
      {fields.map((field, i) => (
        <ResponsibilitiesFormItem
          key={field.id}
          index={i}
          formName={formName}
          remove={remove}
          setIndex={setIndex}
          onOpen={() => openEditModal(i)}
        />
      ))}

      <div className='my-2'>
        <Button
          onClick={() => {
            append({ link: '', label: '', description: '', imageUrl: '' });
            setIndex(fields.length);
            setModals?.({ 'responsibilities-edit': true });
          }}
          disabled={some(items, ['label', ''])}
          className='flex items-center gap-2'
          variant='outline'
          size='sm'
        >
          <BsPlusCircle />
          Add {items?.length ? 'another' : 'a'} {label}
        </Button>
      </div>

      <Modal name='responsibilities-edit' title='Edit Responsibility' size='lg'>
        <Form {...localForm}>
          <form onSubmit={handleSubmit(saveEditedItem)} className='space-y-4'>
            <div className='flex w-full justify-center'>
              <Card className='w-[4/5] p-4'>
                <ResponsibilityHeader editingItem={item as Authority} label={responsibilityLabel} link={link} />
              </Card>
            </div>

            <Input
              label='Responsibility Name'
              name='label'
              placeholder='Name'
              localForm={localForm}
              options={{
                required: 'Responsibility name is required',
                maxLength: {
                  value: CONFIG.SHADE_HEADING_LENGTH,
                  message: 'Responsibility name is too long',
                },
              }}
            />

            <Textarea
              label='Description'
              name='description'
              placeholder='Enter a description here (supports Markdown)'
              localForm={localForm}
            />

            <Input label='Responsibility Link' name='link' placeholder='https://example.com' localForm={localForm} />

            <DropZone
              label='Image'
              getRootProps={getRootProps}
              getInputProps={getInputProps}
              isFocused={isFocused}
              isDragAccept={isDragAccept}
              isDragReject={isDragReject}
              isFullWidth
              image={imageUrl}
              imageUrl={formatImageUrl(item?.imageUrl)}
            />

            <div className='mt-6 flex justify-end'>
              <Button variant='outline' className='mr-3' onClick={saveEditedItem}>
                Cancel
              </Button>
              <Button disabled={some(errors) || !isDirty} type='submit'>
                <BsSave /> Save
              </Button>
            </div>
          </form>
        </Form>
      </Modal>
    </div>
  );
};

export { ResponsibilitiesForm };
