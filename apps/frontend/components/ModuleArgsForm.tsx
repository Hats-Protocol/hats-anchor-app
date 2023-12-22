import {
  Box,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { solidityToTypescriptType } from '@hatsprotocol/modules-sdk';
import { transformAndVerify } from 'app-utils';
import { AppHat, ModuleCreationArg } from 'hats-types';
import { decimalId } from 'hats-utils';
import _ from 'lodash';
import { ChangeEvent, useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { BsTextLeft } from 'react-icons/bs';
import { FaInfoCircle } from 'react-icons/fa';
import { prettyIdToIp } from 'shared-utils';
import { Hex, isAddress, parseUnits } from 'viem';
import { useToken } from 'wagmi';

import { useTreeForm } from '../contexts/TreeFormContext';
import DatePicker from './atoms/DatePicker';
import Input from './atoms/Input';
import NumberInput from './atoms/NumberInput';
import Select from './atoms/Select';
import FormRowWrapper from './FormRowWrapper';

const fallbackExamples = {
  address: '0x3bc1A0Ad72417f2d41...',
  number: '10',
};

const ModuleFormInput = ({
  localForm,
  arg,
  tokenAddress,
}: {
  localForm: UseFormReturn;
  arg: ModuleCreationArg;
  tokenAddress: Hex;
}) => {
  const { onchainTree } = useTreeForm();
  const [customHatSelections, setCustomHatSelections] = useState({});

  const { watch, setValue } = localForm;

  const localTokenAddress = watch('Token Address', '');
  const { data: tokenDetails } = useToken({
    address: tokenAddress || localTokenAddress,
    enabled:
      (!!tokenAddress && isAddress(tokenAddress)) ||
      (!!localTokenAddress && isAddress(localTokenAddress)),
  });
  const tokenDecimals = tokenDetails?.decimals;

  const handleChangeAddress = (
    e: ChangeEvent<HTMLInputElement>,
    name: string,
  ) => {
    const trimmedValue = e.target.value.trim();
    setValue(name, trimmedValue, { shouldDirty: true });
  };

  const handleChangeHat = (
    e: ChangeEvent<HTMLSelectElement>,
    argName: string,
  ) => {
    setCustomHatSelections((prevState) => {
      const newState = { ...prevState };

      if (e.target.value === 'custom') {
        newState[argName] = true;
      } else {
        newState[argName] = false;
        localForm.setValue(`${argName}_custom`, undefined, {
          shouldDirty: true,
        });
      }

      return newState;
    });
  };

  // might wanna implement something similar in the NumberInput component
  const handleAmountWithDecimalsChange = (e, argName) => {
    let { value } = e.target;

    if (value.startsWith('-')) {
      value = value.replace(/-/g, '');
    }

    // Remove any non-numeric characters except for a single decimal point
    value = value.replace(/[^\d.]/g, '');

    if (!_.isNaN(parseFloat(value)) && _.isFinite(value)) {
      setValue(argName, value, { shouldDirty: true });
    }
  };

  useEffect(() => {
    // set default value(s)
    if (arg.type === 'bool') setValue(arg.name, true);
  }, []);

  if (!arg) return null;

  if (
    arg.displayType === 'erc20' ||
    arg.displayType === 'erc721' ||
    arg.displayType === 'erc1155' ||
    arg.displayType === 'jokerace' ||
    // TODO handle address/address[] separately
    arg.type === 'address' ||
    arg.type === 'address[]'
  ) {
    return (
      <Input
        name={arg.name}
        label={`${arg.name} ${arg.optional ? '(Optional)' : ''}`}
        subLabel={arg.description}
        placeholder={
          Array.isArray(arg.example)
            ? (arg.example as string[]).join(', ')
            : (arg.example as string) || fallbackExamples.address
        }
        options={{
          required: !arg.optional,
          validate: (value) => {
            if (!isAddress(value)) return 'Invalid address';
            return true;
          },
        }}
        localForm={localForm}
        onChange={(e) => handleChangeAddress(e, arg.name)}
      />
    );
  }

  if (arg.type === 'bool') {
    const isChecked = watch(arg.name);

    return (
      <FormControl as={HStack} align='center'>
        <Checkbox isChecked={isChecked} />
        <FormLabel m={0}>{arg.name}</FormLabel>
        <Box h='16px'>
          <Tooltip
            as={Flex}
            align='center'
            label={arg.description}
            placement='right'
            shouldWrapChildren
            hasArrow
          >
            <Icon as={FaInfoCircle} my='auto' boxSize={4} color='blue.500' />
          </Tooltip>
        </Box>
      </FormControl>
    );
  }

  if (arg.displayType === 'hat') {
    return (
      <Stack>
        <Select
          name={arg.name}
          label={`${arg.name} ${arg.optional ? '(Optional)' : ''}`}
          subLabel={arg.description}
          localForm={localForm}
          placeholder='Select a hat'
          defaultValue={undefined}
          options={{
            required: !arg.optional,
            validate: (value) =>
              String(value) === 'custom' || transformAndVerify(value, arg.type),
          }}
          onChange={(e) => handleChangeHat(e, arg.name)}
        >
          <option value='custom'>Custom</option>
          {_.map(onchainTree, ({ id, prettyId, detailsObject }: AppHat) => {
            const hatName = detailsObject?.data?.name;
            return (
              <option value={decimalId(id)} key={id}>
                {`${hatName ? `${hatName} - ` : ''}${prettyIdToIp(prettyId)}`}
              </option>
            );
          })}
        </Select>
        {customHatSelections[arg.name] && (
          <Input
            name={`${arg.name}_custom`}
            label='Custom Hat ID'
            placeholder='e.g. 285.1.3'
            localForm={localForm}
            options={{
              required: !arg.optional,
              // validation - check if the hat exists
            }}
          />
        )}
      </Stack>
    );
  }

  if (arg.displayType === 'amountWithDecimals') {
    return (
      <NumberInput
        name={arg.name}
        label={`${arg.name} ${arg.optional ? '(Optional)' : ''}`}
        subLabel={arg.description}
        options={{
          min: 0,
        }}
        placeholder={
          Array.isArray(arg.example)
            ? (arg.example as string[]).join(', ')
            : (arg.example as string) || fallbackExamples.number
        }
        isRequired={!arg.optional}
        customValidations={{
          validate: (value) => {
            if (!value) return false;
            const numericValue = parseFloat(value);

            if (!tokenDecimals) return 'No token selected';

            if (!_.isNaN(numericValue) && numericValue > 0) {
              try {
                return transformAndVerify(
                  parseUnits(value, tokenDecimals),
                  arg.type,
                );
              } catch (error) {
                // eslint-disable-next-line no-console
                console.error('Error parsing units:', error);
                return 'Error parsing units';
              }
            }

            return 'Not a valid number';
          },
        }}
        onChange={(e) => handleAmountWithDecimalsChange(e, arg.name)}
        localForm={localForm}
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
      />
    );
  }

  if (arg.displayType === 'seconds') {
    return (
      <NumberInput
        name={arg.name}
        label={`${arg.name} ${arg.optional ? '(Optional)' : ''}`}
        type='number'
        subLabel={arg.description}
        placeholder={
          Array.isArray(arg.example)
            ? (arg.example as string[]).join(', ')
            : (arg.example as string)
        }
        isRequired={!arg.optional}
        customValidations={{
          validate: (value) =>
            transformAndVerify(parseUnits(value, tokenDecimals), arg.type),
        }}
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
        customValidations={{
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

const ModuleArgsForm = ({
  localForm,
  tokenAddress,
  selectedModuleArgs,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  tokenAddress?: Hex;
  selectedModuleArgs: ModuleCreationArg[];
}) => {
  console.log(selectedModuleArgs);

  return selectedModuleArgs?.map((arg: ModuleCreationArg) => (
    <FormRowWrapper key={arg.name}>
      <Icon as={BsTextLeft} boxSize={4} mt={1} />
      <ModuleFormInput
        arg={arg}
        localForm={localForm}
        tokenAddress={tokenAddress}
      />
    </FormRowWrapper>
  ));
};

export default ModuleArgsForm;
