'use client';

import { Icon, Stack } from '@chakra-ui/react';
import { ModuleCreationArg } from '@hatsprotocol/modules-sdk';
import _ from 'lodash';
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
    <Stack spacing={3}>
      {_.map(selectedModuleArgs, (arg: ModuleCreationArg) => (
        <FormRowWrapper key={arg.name} noMargin={noMargin}>
          {!hideIcon && <Icon as={BsTextLeft} boxSize={4} mt={1} />}
          <ModuleFormInput
            arg={arg}
            fullArgs={selectedModuleArgs}
            localForm={localForm}
            tokenAddress={tokenAddress}
            isDeploy={isDeploy}
          />
        </FormRowWrapper>
      ))}
    </Stack>
  );
};

export { ModuleArgsForm };
