import { Icon, Stack } from '@chakra-ui/react';
import { solidityToTypescriptType } from '@hatsprotocol/modules-sdk';
import { transformAndVerify } from 'app-utils';
import { AppHat, ModuleCreationArg } from 'hats-types';
import { decimalId } from 'hats-utils';
import _ from 'lodash';
import { ChangeEvent, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { BsTextLeft } from 'react-icons/bs';
import { prettyIdToIp } from 'shared-utils';
import { isAddress, parseUnits } from 'viem';
import { useToken } from 'wagmi';

import { useTreeForm } from '../contexts/TreeFormContext';
import DatePicker from './atoms/DatePicker';
import Input from './atoms/Input';
import NumberInput from './atoms/NumberInput';
import Select from './atoms/Select';
import FormRowWrapper from './FormRowWrapper';

const ModuleArgsInputs = ({
  localForm,
  selectedModuleArgs,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  selectedModuleArgs: ModuleCreationArg[];
}) => {
  const { onchainTree } = useTreeForm();
  const { watch, setValue } = localForm;
  const [customHatSelections, setCustomHatSelections] = useState({});
  const tokenAddress = watch('Token Address', '');
  const { data } = useToken({ address: tokenAddress });
  const tokenDecimals = data?.decimals;

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

  return selectedModuleArgs?.map((arg: ModuleCreationArg) => (
    <FormRowWrapper key={arg.name}>
      <Icon as={BsTextLeft} boxSize={4} mt={1} />
      {arg.displayType === 'default' &&
        (solidityToTypescriptType(arg.type) === 'bigint' ? (
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
        ) : (
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
        ))}
      {(arg.displayType === 'token' || arg.displayType === 'jokerace') && (
        <Input
          name={arg.name}
          label={`${arg.name} ${arg.optional ? '(Optional)' : ''}`}
          subLabel={arg.description}
          placeholder={
            Array.isArray(arg.example)
              ? (arg.example as string[]).join(', ')
              : (arg.example as string)
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
      )}
      {arg.displayType === 'hat' && (
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
                String(value) === 'custom' ||
                transformAndVerify(value, arg.type),
            }}
            onChange={(e) => handleChangeHat(e, arg.name)}
          >
            {_.map(onchainTree, ({ id, prettyId, detailsObject }: AppHat) => {
              const hatName = detailsObject?.data?.name;
              return (
                <option value={decimalId(id)} key={id}>
                  {`${hatName ? `${hatName} - ` : ''}${prettyIdToIp(prettyId)}`}
                </option>
              );
            })}
            <option value='custom'>Custom</option>
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
      )}
      {arg.displayType === 'timestamp' && (
        <DatePicker
          name={arg.name}
          label={`${arg.name} ${arg.optional ? '(Optional)' : ''}`}
          subLabel={arg.description}
          localForm={localForm}
        />
      )}
      {arg.displayType === 'seconds' && (
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
      )}
      {arg.displayType === 'amountWithDecimals' && (
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
              : (arg.example as string)
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
      )}
    </FormRowWrapper>
  ));
};

export default ModuleArgsInputs;
