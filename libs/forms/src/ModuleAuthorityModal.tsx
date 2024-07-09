'use client';

import { Button, Flex, HStack, Stack, Text } from '@chakra-ui/react';
import { AUTHORITY_TYPES } from '@hatsprotocol/constants';
import { HsgType } from '@hatsprotocol/hsg-sdk';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { Modal, useOverlay, useTreeForm } from 'contexts';
import { index } from 'd3';
import _ from 'lodash';
import { useCallHsgFunction, useCallModuleFunction } from 'modules-hooks';
import { useForm } from 'react-hook-form';
import { Authority } from 'types';

import { ModuleArgsForm } from './components';

const ModuleAuthorityModal = ({
  authority,
  selectedFunction,
}: {
  authority: Authority;
  selectedFunction: any;
}) => {
  const { setModals } = useOverlay();
  const { chainId } = useTreeForm();
  const localForm = useForm({ mode: 'onChange' });
  const { formState, handleSubmit } = localForm;
  const { mutate: callModuleFunction } = useCallModuleFunction({
    chainId,
  });

  const { mutate: callHsgFunction } = useCallHsgFunction({
    chainId,
  });

  const authorityHatId = hatIdDecimalToIp(BigInt(authority?.hatId || '0'));

  const onSubmit = (args: any) => {
    if (!authority || !selectedFunction) return;
    if (authority.type === AUTHORITY_TYPES.modules) {
      const localArgs = args;
      // ! workaround for hat being an arg on Passthrough module
      if (
        !_.isEmpty(_.filter(_.get(selectedFunction, 'args'), { name: 'Hat' }))
      ) {
        localArgs.Hat = authority?.hatId;
      }
      callModuleFunction({
        instance: authority.instanceAddress,
        func: selectedFunction || undefined,
        args: localArgs,
        moduleId: authority.moduleAddress,
        onSuccess: () => {
          setModals?.({ [`functionCall-${authority.label}-${index}`]: false });
        },
      });
    } else {
      callHsgFunction({
        instance: authority.instanceAddress,
        func: selectedFunction || undefined,
        args,
        type: authority.type as HsgType,
        onSuccess: () => {
          setModals?.({ [`functionCall-${authority.label}-${index}`]: false });
        },
      });
    }
  };

  return (
    <Modal
      name={`functionCall-${authority?.label}-${index}`}
      title={`${_.capitalize(
        _.get(selectedFunction, 'label'),
      )} for Hat #${authorityHatId}`}
    >
      <Stack spacing={6} as='form' onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={1}>
          {_.get(selectedFunction, 'description') && (
            <Text>{_.get(selectedFunction, 'description')}</Text>
          )}
        </Stack>

        <Stack>
          <ModuleArgsForm
            selectedModuleArgs={_.get(selectedFunction, 'args', [])}
            localForm={localForm}
            hideIcon
            noMargin
            isDeploy={false}
            // ? need `tokenAddress` ?
          />
        </Stack>
        <Flex justify='flex-end'>
          <HStack>
            <Button variant='outline' onClick={() => setModals?.({})}>
              Cancel
            </Button>
            <Button
              colorScheme='blue'
              type='submit'
              isDisabled={!formState.isValid}
              // TODO alternative for loading here?
              // isLoading={isModuleLoading || isHsgLoading}
            >
              {_.capitalize(_.get(selectedFunction, 'label'))}
            </Button>
          </HStack>
        </Flex>
      </Stack>
    </Modal>
  );
};

export default ModuleAuthorityModal;
