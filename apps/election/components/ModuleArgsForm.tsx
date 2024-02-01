import { HStack, Icon, Radio, RadioGroup, Stack, Text } from '@chakra-ui/react';
import { solidityToTypescriptType } from '@hatsprotocol/modules-sdk';
import { useDebounce } from 'app-hooks';
import { explorerUrl, transformAndVerify } from 'app-utils';
import { ModuleCreationArg } from 'hats-types';
import _ from 'lodash';
import { ChangeEvent, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { BsTextLeft } from 'react-icons/bs';
import { Hex, isAddress, parseUnits } from 'viem';
import { useEnsAddress, useToken } from 'wagmi';

import { useEligibility } from '../contexts/EligibilityContext';
import AddressInput from './AddressInput';
import ChakraNextLink from './atoms/ChakraNextLink';
import DatePicker from './atoms/DatePicker';
import DurationInput from './atoms/DurationInput';
import Input from './atoms/Input';
import NumberInput from './atoms/NumberInput';
import FormRowWrapper from './FormRowWrapper';
import MultiAddressInput from './MultiAddressInput';

const fallbackExamples = {
  address: '0x3bc1A0Ad72417f2d41...',
  number: '10',
  booleanOption: ['True', 'False'],
};

const booleanOptionSets = {
  standing: ['Good Standing', 'Bad Standing'],
  eligibility: ['Eligible', 'Ineligible'],
  status: ['Active', 'Inactive'],
};

const ModuleFormInput = ({
  localForm,
  arg,
  tokenAddress,
  isDeploy,
}: {
  localForm: UseFormReturn;
  arg: ModuleCreationArg;
  tokenAddress: Hex;
  isDeploy?: boolean;
}) => {
  const { chainId } = useEligibility();

  const { watch, setValue } = localForm;

  const tokenArgName = arg.displayType === 'token' ? arg.name : '';
  const localTokenAddress = watch(tokenArgName, '');
  const { data: tokenDetails } = useToken({
    address: localTokenAddress || tokenAddress,
    chainId,
    enabled:
      (!!tokenAddress && isAddress(tokenAddress)) ||
      (!!localTokenAddress && isAddress(localTokenAddress)),
  });
  const tokenDecimals = tokenDetails?.decimals;
  const tokenLabel = `${tokenDetails?.name} ($${tokenDetails?.symbol})`;

  const handleChangeAddress = (
    e: ChangeEvent<HTMLInputElement>,
    name: string,
  ) => {
    const trimmedValue = e.target.value.trim();
    setValue(name, trimmedValue, { shouldDirty: true });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const newWearer = useDebounce<string>(watch(arg.name, null));

  const { data: newWearerResolvedAddress } = useEnsAddress({
    name: newWearer,
    chainId: 1,
  });

  const showNewResolvedAddress =
    newWearerResolvedAddress && newWearer !== newWearerResolvedAddress;

  if (!arg) return null;

  if (
    arg.displayType === 'erc20' ||
    arg.displayType === 'erc721' ||
    arg.displayType === 'erc1155' ||
    arg.displayType === 'jokerace'
  ) {
    let argHelper = null;
    // TODO separate ArgHelper?
    if (
      arg.displayType === 'erc20' &&
      !tokenDetails &&
      (localTokenAddress || tokenAddress)
    ) {
      if (!tokenDetails) {
        argHelper = <Text color='red.500' />;
      } else {
        argHelper = (
          <ChakraNextLink
            href={`${explorerUrl(chainId)}/address/${tokenAddress}`}
            isExternal
          >
            <Text fontSize='sm' color='gray.500'>
              {tokenLabel}
            </Text>
          </ChakraNextLink>
        );
      }
    }

    return (
      <Stack>
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
        {argHelper}
      </Stack>
    );
  }

  // TEMPORARILY added descriptor here while registry hasn't been updated for token types
  if (arg.type === 'address') {
    return (
      <Stack w='100%' spacing={1}>
        <AddressInput
          name={arg.name}
          label={`${arg.name} ${arg.optional ? '(Optional)' : ''}`}
          subLabel={arg.description}
          showResolvedAddress={showNewResolvedAddress}
          resolvedAddress={String(newWearerResolvedAddress)}
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
        {tokenDetails && (
          <ChakraNextLink
            href={`${explorerUrl(chainId)}/address/${
              localTokenAddress || tokenAddress
            }`}
            isExternal
          >
            <Text fontSize='sm' color='gray.500'>
              {tokenLabel}
            </Text>
          </ChakraNextLink>
        )}
      </Stack>
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
            ? (arg.example as string[]).join(', ')
            : (arg.example as string) || fallbackExamples.address
        }
        localForm={localForm}
      />
    );
  }

  if (arg.type === 'bool') {
    const booleanOptions =
      booleanOptionSets[_.toLower(arg.name)] || fallbackExamples.booleanOption;

    return (
      <Stack spacing={1}>
        <Stack alignItems='start' spacing={1}>
          <HStack>
            <Text textTransform='uppercase'>{arg.name}</Text>
          </HStack>
          <Text color='gray.600' fontSize='sm'>
            {arg.description}
          </Text>
        </Stack>

        <RadioGroup
          name={arg.name}
          defaultValue={_.first(booleanOptions)}
          onChange={(value) => setValue(arg.name, value)}
        >
          <HStack spacing={4}>
            {_.map(booleanOptions, (option) => (
              <Radio value={option} key={option}>
                {option}
              </Radio>
            ))}
          </HStack>
        </RadioGroup>
      </Stack>
    );
  }

  if (arg.displayType === 'amountWithDecimals') {
    return (
      <Stack w='100%' spacing={1}>
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
        {tokenDetails && (
          <Text fontSize='sm' color='gray.500'>
            ${tokenDetails?.symbol} uses {tokenDecimals} decimals
          </Text>
        )}
      </Stack>
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
      <DurationInput
        name={arg.name}
        label={`${arg.name} ${arg.optional ? '(Optional)' : ''}`}
        subLabel={arg.description}
        placeholder={
          Array.isArray(arg.example)
            ? (arg.example as string[]).join(', ')
            : (arg.example as string)
        }
        isRequired={!arg.optional}
        customValidations={{
          validate: (value) =>
            transformAndVerify(localForm.watch(arg.name), arg.type),
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
  hideIcon,
  noMargin,
  isDeploy = true,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  tokenAddress?: Hex;
  selectedModuleArgs: ModuleCreationArg[];
  hideIcon?: boolean;
  noMargin?: boolean;
  isDeploy?: boolean;
}) => {
  return (
    <Stack spacing={3}>
      {selectedModuleArgs?.map((arg: ModuleCreationArg) => (
        <FormRowWrapper key={arg.name} noMargin={noMargin}>
          {!hideIcon && <Icon as={BsTextLeft} boxSize={4} mt={1} />}
          <ModuleFormInput
            arg={arg}
            localForm={localForm}
            tokenAddress={tokenAddress}
            isDeploy={isDeploy}
          />
        </FormRowWrapper>
      ))}
    </Stack>
  );
};

export default ModuleArgsForm;
