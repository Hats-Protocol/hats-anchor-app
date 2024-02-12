import { FALLBACK_ARG_EXAMPLES } from '@hatsprotocol/constants';
import { solidityToTypescriptType } from '@hatsprotocol/modules-sdk';
import { transformAndVerify } from 'app-utils';
import { ModuleCreationArg } from 'hats-types';
import _ from 'lodash';
import { UseFormReturn } from 'react-hook-form';
import { Hex } from 'viem';

import {
  DatePicker,
  DurationInput,
  Input,
  MultiAddressInput,
  NumberInput,
} from '..';
import AddressInput from './AddressInput';
import AmountWithDecimals from './AmountWithDecimals';
import BooleanInput from './BooleanInput';
import HatInput from './HatInput';

const ModuleFormInput = ({
  localForm,
  arg,
  fullArgs,
  tokenAddress,
  isDeploy,
}: {
  localForm: UseFormReturn;
  arg: ModuleCreationArg;
  fullArgs: ModuleCreationArg[];
  tokenAddress: Hex | undefined;
  isDeploy?: boolean;
}) => {
  if (!arg) return null;

  if (arg.type === 'address') {
    // TODO handle undefined tokenAddress
    return (
      <AddressInput
        arg={arg}
        localForm={localForm}
        tokenAddress={tokenAddress || '0x'}
      />
    );
  }

  if (arg.type === 'address[]') {
    return (
      <MultiAddressInput
        name={arg.name}
        label={`${arg.name} (Optional)`}
        subLabel={arg.description}
        placeholder={
          Array.isArray(arg.example)
            ? _.first(arg.example as string[])
            : (arg.example as string) || FALLBACK_ARG_EXAMPLES.address
        }
        localForm={localForm}
      />
    );
  }

  if (arg.type === 'bool') {
    <BooleanInput arg={arg} localForm={localForm} />;
  }

  if (arg.displayType === 'hat') {
    if (!isDeploy) return null;

    return <HatInput arg={arg} localForm={localForm} />;
  }

  if (arg.displayType === 'amountWithDecimals') {
    // TODO handle undefined tokenAddress
    return (
      <AmountWithDecimals
        arg={arg}
        fullArgs={fullArgs}
        localForm={localForm}
        tokenAddress={tokenAddress}
      />
    );
  }

  if (arg.displayType === 'timestamp') {
    return (
      <DatePicker
        name={arg.name}
        label={`${arg.name} ${arg.optional ? '(Optional)' : ''}`}
        subLabel={arg.description}
        localForm={localForm}
        setToZeroUTC
      />
    );
  }

  if (arg.displayType === 'seconds') {
    return (
      <DurationInput
        name={arg.name}
        label={`${arg.name} ${arg.optional ? '(Optional)' : ''}`}
        subLabel={arg.description}
        placeholder={
          Array.isArray(arg.example)
            ? (arg.example as string[]).join(', ')
            : (arg.example as string)
        }
        localForm={localForm}
      />
    );
  }

  if (solidityToTypescriptType(arg.type) === 'bigint') {
    return (
      <NumberInput
        name={arg.name}
        label={`${arg.name} ${arg.optional ? '(Optional)' : ''}`}
        subLabel={arg.description}
        placeholder={
          Array.isArray(arg.example)
            ? (arg.example as string[]).join(', ')
            : (arg.example as string)
        }
        isRequired={!arg.optional}
        localForm={localForm}
        options={{
          validate: (value) => transformAndVerify(value, arg.type),
        }}
      />
    );
  }

  return (
    <Input
      name={arg.name}
      label={`${arg.name} ${arg.optional ? '(Optional)' : ''}`}
      subLabel={arg.description}
      placeholder={
        Array.isArray(arg.example)
          ? (arg.example as string[]).join(', ')
          : (arg.example as string)
      }
      localForm={localForm}
      options={{
        required: !arg.optional,
        validate: (value) => transformAndVerify(value, arg.type),
      }}
    />
  );
};

export default ModuleFormInput;
