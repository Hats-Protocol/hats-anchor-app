'use client';

import { AUTHORITY_TYPES } from '@hatsprotocol/constants';
import { HsgType } from '@hatsprotocol/hsg-sdk';
import { ModuleCreationArg } from '@hatsprotocol/modules-sdk';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { Modal, useOverlay, useTreeForm } from 'contexts';
import { capitalize, filter, get, isEmpty, pick } from 'lodash';
import { useCallHsgFunction, useCallModuleFunction } from 'modules-hooks';
import { useForm } from 'react-hook-form';
import { Authority, ModuleFunction } from 'types';
import { Button } from 'ui';
import { Hex } from 'viem';

import { ModuleArgsForm } from './components';

const ModuleAuthorityModal = ({
  authority,
  selectedFunction,
  index,
  setSelectedFunction,
}: ModuleAuthorityModalProps) => {
  const { setModals } = useOverlay();
  const { chainId } = useTreeForm();
  const localForm = useForm({ mode: 'onChange' });
  const { formState, handleSubmit, reset } = localForm;
  const { mutate: callModuleFunction } = useCallModuleFunction({
    chainId,
  });
  const { isValid } = pick(formState, ['isValid']);

  const { mutate: callHsgFunction } = useCallHsgFunction({
    chainId,
  });

  const authorityHatId = hatIdDecimalToIp(BigInt(authority?.hatId || '0'));

  const onSubmit = (args: any) => {
    if (!authority || !selectedFunction) return;

    if (authority.type === AUTHORITY_TYPES.modules) {
      const localArgs = args;
      // ! workaround for hat being an arg on Passthrough module
      if (!isEmpty(filter(get(selectedFunction, 'args'), { name: 'Hat' }))) {
        localArgs.Hat = authority?.hatId;
      }
      callModuleFunction({
        instance: authority.instanceAddress as Hex,
        func: selectedFunction || undefined,
        args: localArgs,
        moduleId: authority.moduleAddress,
        onSuccess: () => {
          setModals?.({ [`functionCall-${authority.label}-${index}`]: false });
        },
      });
    } else {
      callHsgFunction({
        instance: authority.instanceAddress as Hex,
        func: selectedFunction || undefined,
        args,
        type: authority.type as HsgType,
        onSuccess: () => {
          setModals?.({ [`functionCall-${authority.label}-${index}`]: false });
        },
      });
    }
  };

  const onCloseModal = () => {
    reset();
    setSelectedFunction(undefined);
    setModals?.({});
  };

  return (
    <Modal
      name={`functionCall-${authority?.label}-${index}`}
      title={`${capitalize(get(selectedFunction, 'label'))} for Hat #${authorityHatId}`}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='space-y-6'>
          <div className='space-y-1'>
            {get(selectedFunction, 'description') && <p>{get(selectedFunction, 'description')}</p>}
          </div>

          <div className='space-y-6'>
            <ModuleArgsForm
              selectedModuleArgs={get(selectedFunction, 'args', []) as ModuleCreationArg[]}
              localForm={localForm}
              hideIcon
              noMargin
              isDeploy={false}
              // ? need `tokenAddress` ?
            />
          </div>

          <div className='flex justify-end'>
            <div className='flex gap-2'>
              <Button variant='outline' onClick={onCloseModal}>
                Cancel
              </Button>

              <Button type='submit' disabled={!isValid}>
                {capitalize(get(selectedFunction, 'label'))}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};

interface ModuleAuthorityModalProps {
  authority: Authority;
  selectedFunction: ModuleFunction | undefined;
  setSelectedFunction: (func: ModuleFunction | undefined) => void;
  index: number;
}

export { ModuleAuthorityModal };
