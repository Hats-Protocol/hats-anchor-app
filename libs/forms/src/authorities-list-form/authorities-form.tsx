'use client';

import { CONFIG } from '@hatsprotocol/config';
import { AUTHORITY_TYPES } from '@hatsprotocol/constants';
import { Modal, useOverlay } from 'contexts';
import { usePinImageIpfs } from 'hooks';
import { pick, some } from 'lodash';
import { AuthorityHeader } from 'molecules';
import { useEffect, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import { BsSave } from 'react-icons/bs';
import { Authority } from 'types';
import { DropZone } from 'ui';
import { Button, Card } from 'ui';
import { formatImageUrl, getHostnameFromURL } from 'utils';
import { Hex } from 'viem';

import { Form, Input, Textarea } from '../components';

const AuthoritiesForm = ({ formName, localForm, index, hatForm, chainId, hatId }: AuthoritiesFormProps) => {
  const { setModals } = useOverlay();
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
    setModals?.({});

    reset();
  };

  const isGate = type === AUTHORITY_TYPES.gate;
  const guildOrSnapshot = useMemo(() => {
    return getHostnameFromURL(gate) === 'guild.xyz' || getHostnameFromURL(link) === 'snapshot.org';
  }, [gate, link]);

  return (
    <Modal name='authorities-edit' title='Edit Authority' size='xl'>
      <div className='flex flex-col gap-8'>
        <div className='flex w-full justify-center'>
          <Card className='border-radius-4 box-shadow-md w-80% p-4'>
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
        </div>

        <Form {...localForm}>
          <form onSubmit={handleSubmit(saveEditedItem)} className='flex flex-col gap-4'>
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

            <div className='mt-4 flex justify-end'>
              <div className='flex gap-2'>
                <Button variant='outline' onClick={() => setModals?.({})}>
                  Cancel
                </Button>
                <Button disabled={some(errors)} type='submit'>
                  <BsSave className='h-4 w-4' />
                  Save
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </Modal>
  );
};

interface AuthoritiesFormProps {
  formName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  index: number | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hatForm: UseFormReturn<any>;
  chainId: number | undefined;
  hatId: Hex | undefined;
}

export { AuthoritiesForm, type AuthoritiesFormProps };
