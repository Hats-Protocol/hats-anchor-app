'use client';

import { Box, Button, HStack, Icon as IconWrapper, Stack, Text, useDisclosure } from '@chakra-ui/react';
import { Modal, useHatForm, useOverlay, useSelectedHat, useTreeForm } from 'contexts';
import { get, pick, some } from 'lodash';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import posthog from 'posthog-js';
import { ReactNode, useState } from 'react';
import { Control, useFieldArray, useForm } from 'react-hook-form';
import { IconType } from 'react-icons';
import { BsPlusCircle } from 'react-icons/bs';

import { HsgDeployForm } from '../hsg-deploy-form';
import { AuthoritiesForm } from './authorities-form';
import AuthoritiesFormItem from './authorities-form-item';

const Safe = dynamic(() => import('icons').then((mod) => mod.Safe));

interface AuthoritiesFormListProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formName: string;
  title: string;
  subtitle?: string | ReactNode;
  Icon: IconType;
  label: string;
}

const ENABLE_HSG_DEPLOY = false;

export const AuthoritiesListForm = ({ formName, title, Icon, subtitle, label }: AuthoritiesFormListProps) => {
  // CONTEXTS
  const { chainId } = useTreeForm();
  const { selectedHat } = useSelectedHat();
  const { localForm: hatForm } = useHatForm();
  const { setModals } = useOverlay();
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
  const { setValue, reset, watch } = pick(localForm, ['setValue', 'reset', 'handleSubmit', 'watch']);
  const items = hatWatch?.(formName);
  const item = watch();

  const { fields, append, remove } = useFieldArray({
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
    onOpen();
  };

  const hsgEnabled = posthog.isFeatureEnabled('hsg-deploy') || process.env.NODE_ENV === 'development';

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
          {subtitle && typeof subtitle !== 'string' ? subtitle : <Text variant='gray'>{subtitle}</Text>}
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

            {/* temporary button until edit mode v2 */}

            {get(selectedHat, 'levelAtLocalTree', 0) > 0 &&
              (hsgEnabled ? (
                <>
                  <Button
                    variant='outline'
                    onClick={() => setModals?.({ 'hsg-deploy-modal': true })}
                    leftIcon={<IconWrapper as={Safe} />}
                  >
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
                    <Button variant='outline' leftIcon={<IconWrapper as={Safe} />}>
                      Add a Safe
                    </Button>
                  </Link>
                )
              ))}
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
