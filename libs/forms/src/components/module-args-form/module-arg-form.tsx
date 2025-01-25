'use client';

import { ModuleCreationArg } from '@hatsprotocol/modules-sdk';
import { map } from 'lodash';
import { UseFormReturn } from 'react-hook-form';
import { BsTextLeft } from 'react-icons/bs';
import { Hex } from 'viem';

import { FormRowWrapper } from '../form-row-wrapper';
import { ModuleFormInput } from './module-form-input';

const ModuleArgsForm = ({
  localForm,
  tokenAddress,
  selectedModuleArgs,
  hideIcon,
  noMargin,
  isDeploy = true,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  tokenAddress?: Hex;
  selectedModuleArgs: ModuleCreationArg[] | undefined;
  hideIcon?: boolean;
  noMargin?: boolean;
  isDeploy?: boolean;
}) => {
  if (!selectedModuleArgs) return null;

  return (
    <div className='flex flex-col gap-3'>
      {map(selectedModuleArgs, (arg: ModuleCreationArg) => (
        <FormRowWrapper key={arg.name} noMargin={noMargin}>
          {!hideIcon && <BsTextLeft className='mt-1 h-4 w-4' />}
          <ModuleFormInput
            arg={arg}
            fullArgs={selectedModuleArgs}
            localForm={localForm}
            tokenAddress={tokenAddress}
            isDeploy={isDeploy}
          />
        </FormRowWrapper>
      ))}
    </div>
  );
};

export { ModuleArgsForm };
