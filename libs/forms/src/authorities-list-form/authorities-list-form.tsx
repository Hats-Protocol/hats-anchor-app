'use client';

import { Modal, useHatForm, useOverlay, useSelectedHat, useTreeForm } from 'contexts';
import { Safe } from 'icons';
import { get, pick, some } from 'lodash';
import Link from 'next/link';
import { ReactNode, useState } from 'react';
import { Control, useFieldArray, useForm } from 'react-hook-form';
import { IconType } from 'react-icons';
import { BsPlusCircle } from 'react-icons/bs';
import { Button } from 'ui';

import { HsgDeployForm } from '../hsg-deploy-form';
import { AuthoritiesForm } from './authorities-form';
import { AuthoritiesFormItem } from './authorities-form-item';

interface AuthoritiesFormListProps {
  formName: string;
  title: string;
  subtitle?: string | ReactNode;
  Icon: IconType;
  label: string;
}

const ENABLE_HSG_DEPLOY = false;

const AuthoritiesListForm = ({ formName, title, Icon, subtitle, label }: AuthoritiesFormListProps) => {
  // CONTEXTS
  const { chainId } = useTreeForm();
  const { selectedHat } = useSelectedHat();
  const { localForm: hatForm } = useHatForm();
  const { setModals } = useOverlay();
  // LOCAL STATE
  const [editingIndex, setEditingIndex] = useState<number>();

  // FORMS
  const {
    getValues: hatGetValues,
    watch: hatWatch,
    control: hatControl,
  } = pick(hatForm, ['getValues', 'watch', 'control']);
  const localForm = useForm();
  const { setValue } = pick(localForm, ['setValue']);
  const items = hatWatch?.(formName);

  const { fields, append, remove } = useFieldArray({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: hatControl as Control<any, any>,
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
    setModals?.({ 'authorities-edit': true });
  };

  const hsgEnabled = true || process.env.NODE_ENV !== 'production';

  if (!localForm || !hatForm) return null;

  return (
    <>
      <div className='flex flex-col gap-3'>
        <div className='mb-3'>
          <div className='-ml-7 flex items-center gap-3'>
            {Icon && <Icon className='size-4' />}
            <p className='text-sm font-medium'>{title}</p>
          </div>

          {subtitle && typeof subtitle !== 'string' ? subtitle : <p className='text-sm text-gray-500'>{subtitle}</p>}
        </div>
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

        <div className='my-2'>
          <div className='flex items-center gap-2'>
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
                setModals?.({ 'authorities-edit': true });
              }}
              disabled={some(items, ['label', ''])}
              variant='outline'
            >
              <BsPlusCircle className='size-3' />
              Add {items?.length ? 'another' : 'an'} {label}
            </Button>

            {/* temporary button until edit mode v2 */}

            {get(selectedHat, 'levelAtLocalTree', 0) > 0 &&
              (hsgEnabled ? (
                <>
                  <Button variant='outline' onClick={() => setModals?.({ 'hsg-deploy-modal': true })}>
                    <Safe className='size-3' />
                    Add a Safe
                  </Button>

                  <Modal name='hsg-deploy-modal' title='Create a Safe Multisig'>
                    <HsgDeployForm />
                  </Modal>
                </>
              ) : (
                ENABLE_HSG_DEPLOY && (
                  <Link
                    href='https://hats-signer-gate-portal.vercel.app/deploy'
                    target='_blank'
                    rel='noreferrer noopener'
                    passHref
                  >
                    <Button variant='outline'>
                      <Safe className='h-4 w-4' />
                      Add a Safe
                    </Button>
                  </Link>
                )
              ))}
          </div>
        </div>
      </div>

      <AuthoritiesForm
        formName={formName}
        index={editingIndex}
        localForm={localForm}
        hatForm={hatForm}
        chainId={chainId}
        hatId={selectedHat?.id}
      />
    </>
  );
};

export { AuthoritiesListForm };
