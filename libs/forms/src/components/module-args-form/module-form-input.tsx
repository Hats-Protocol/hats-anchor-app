'use client';

import { FALLBACK_ARG_EXAMPLES } from '@hatsprotocol/constants';
import { solidityToTypescriptType } from '@hatsprotocol/modules-sdk';
import { first, pick } from 'lodash';
import { UseFormReturn } from 'react-hook-form';
import { ModuleCreationArg } from 'types';
import { transformAndVerify } from 'utils';
import { Hex } from 'viem';

import { DatePicker, DurationInput, Input, MultiAddressInput, NumberInput } from '..';
import { ModuleAddressInput } from './address-input';
import { AmountWithDecimals } from './amount-with-decimals';
import { BooleanInput } from './boolean-input';
import { HatInput } from './hat-input';

const arrayPlaceholder = (example: string | string[]) => {
  if (Array.isArray(example)) {
    return example.join(', ');
  }
  return example;
};

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
  const { type, name, optional, displayType, description, example } = pick(arg, [
    'type',
    'name',
    'optional',
    'displayType',
    'description',
    'example',
  ]);

  if (type === 'address') {
    return <ModuleAddressInput arg={arg} localForm={localForm} tokenAddress={tokenAddress || '0x'} />;
  }

  if (type === 'address[]') {
    return (
      <MultiAddressInput
        name={name}
        label={`${name} (Optional)`}
        subLabel={description}
        placeholder={
          Array.isArray(example) ? first(example as string[]) : (example as string) || FALLBACK_ARG_EXAMPLES.address
        }
        localForm={localForm}
        overrideMaxSupply
        checkEligibility={false}
      />
    );
  }

  if (type === 'bool') {
    <BooleanInput arg={arg} localForm={localForm} />;
  }

  if (displayType === 'hat') {
    if (!isDeploy) return null;

    return <HatInput arg={arg} localForm={localForm} />;
  }

  if (displayType === 'amountWithDecimals') {
    return <AmountWithDecimals arg={arg} fullArgs={fullArgs} localForm={localForm} tokenAddress={tokenAddress} />;
  }

  if (displayType === 'timestamp') {
    return (
      <DatePicker
        name={name}
        label={`${name} ${optional ? '(Optional)' : ''}`}
        subLabel={description}
        localForm={localForm}
        setToZeroUTC
      />
    );
  }

  if (displayType === 'seconds') {
    return (
      <DurationInput
        name={name}
        label={`${name} ${optional ? '(Optional)' : ''}`}
        subLabel={description}
        placeholder={arrayPlaceholder(example as string | string[])}
        localForm={localForm}
      />
    );
  }

  if (solidityToTypescriptType(type) === 'bigint') {
    return (
      <NumberInput
        name={name}
        label={`${name} ${optional ? '(Optional)' : ''}`}
        subLabel={description}
        placeholder={arrayPlaceholder(example as string | string[])}
        // isRequired={!optional} // TODO handle required in number input
        localForm={localForm}
        options={{
          validate: (value) => transformAndVerify(value, type),
        }}
      />
    );
  }

  return (
    <Input
      name={name}
      label={`${name} ${optional ? '(Optional)' : ''}`}
      subLabel={description}
      placeholder={arrayPlaceholder(example as string | string[])}
      localForm={localForm}
      options={{
        required: !arg.optional,
        validate: (value) => transformAndVerify(value, arg.type),
      }}
    />
  );
};

export { ModuleFormInput };
