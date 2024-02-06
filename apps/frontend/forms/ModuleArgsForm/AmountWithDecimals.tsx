import { Stack, Text } from '@chakra-ui/react';
import { ModuleCreationArg } from '@hatsprotocol/modules-sdk';
import { FALLBACK_ARG_EXAMPLES } from 'app-constants';
import { transformAndVerify } from 'app-utils';
import _ from 'lodash';
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { NumberInput } from 'ui';
import { Hex, isAddress, parseUnits } from 'viem';
import { useToken } from 'wagmi';

import { useTreeForm } from '../../contexts/TreeFormContext';

const AmountWithDecimals = ({
  arg,
  localForm,
  tokenAddress,
}: {
  arg: ModuleCreationArg;
  localForm: UseFormReturn;
  tokenAddress: Hex;
}) => {
  const { chainId } = useTreeForm();
  const { watch, setValue } = localForm;

  const tokenArgName = arg.displayType === 'erc20' ? arg.name : '';
  const localTokenAddress = watch(tokenArgName, '');
  const { data: tokenDetails } = useToken({
    address: localTokenAddress || tokenAddress,
    chainId,
    enabled:
      (!!tokenAddress && isAddress(tokenAddress)) ||
      (!!localTokenAddress && isAddress(localTokenAddress)),
  });
  const tokenDecimals = tokenDetails?.decimals;

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

  return (
    <Stack w='100%' spacing={1}>
      <NumberInput
        name={arg.name}
        label={`${arg.name} ${arg.optional ? '(Optional)' : ''}`}
        subLabel={arg.description}
        numOptions={{ min: 0 }}
        isDisabled={!tokenDetails}
        placeholder={
          Array.isArray(arg.example)
            ? (arg.example as string[]).join(', ')
            : (arg.example as string) || FALLBACK_ARG_EXAMPLES.number
        }
        isRequired={!arg.optional}
        options={{
          validate: (value) => {
            if (!value) return false;
            const numericValue = parseFloat(value);

            // TODO edge case when decimals isn't set
            if (!tokenDecimals) return 'No token selected';

            if (!_.isNaN(numericValue) && numericValue > 0) {
              console.log(
                'parsing?',
                tokenDecimals,
                parseUnits(value, tokenDecimals || 18),
              );
              try {
                return transformAndVerify(
                  parseUnits(value, tokenDecimals || 18),
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
      {tokenDetails ? (
        <Text fontSize='sm' color='gray.500'>
          ${tokenDetails?.symbol} uses {tokenDecimals} decimals
        </Text>
      ) : (
        <Text fontSize='sm' color='gray.500'>
          Input token address
        </Text>
      )}
    </Stack>
  );
};

export default AmountWithDecimals;
