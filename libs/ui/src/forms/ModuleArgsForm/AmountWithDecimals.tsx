import { Stack, Text } from '@chakra-ui/react';
import {
  FALLBACK_ARG_EXAMPLES,
  TOKEN_ARG_TYPES,
} from '@hatsprotocol/constants';
import { ModuleCreationArg } from '@hatsprotocol/modules-sdk';
import { useTreeForm } from 'contexts';
import _ from 'lodash';
import { UseFormReturn } from 'react-hook-form';
import { transformAndVerify } from 'utils';
import { Hex, parseUnits } from 'viem';
import { useToken } from 'wagmi';

import NumberInput from '../NumberInput';

const AmountWithDecimals = ({
  arg,
  fullArgs,
  localForm,
  tokenAddress,
}: {
  arg: ModuleCreationArg;
  fullArgs: ModuleCreationArg[];
  localForm: UseFormReturn;
  tokenAddress: Hex | undefined;
}) => {
  const { chainId } = useTreeForm();
  const { watch, setValue } = localForm;

  let tokenArgName = '';
  const tokenArg = _.find(fullArgs, (a: ModuleCreationArg) =>
    _.includes(TOKEN_ARG_TYPES, a.displayType),
  );
  if (tokenArg) tokenArgName = tokenArg.name;

  // watch() by default returns whole object, so not good fallback
  const localTokenAddress = tokenArgName ? watch(tokenArgName) : undefined;
  const { data: tokenDetails } = useToken({
    address: tokenAddress || localTokenAddress,
    chainId,
    // enabled:
    //   (!!tokenAddress && isAddress(tokenAddress)) ||
    //   (!!localTokenAddress && isAddress(localTokenAddress)),
  });
  const tokenDecimals = tokenDetails?.decimals;

  // might wanna implement something similar in the NumberInput component
  const handleAmountWithDecimalsChange = (e: any, argName: any) => {
    let { value } = e.target;

    if (value.startsWith('-')) {
      value = value.replace(/-/g, '');
    }

    // Remove any non-numeric characters except for a single decimal point
    value = value.replace(/[^\d.]/g, '');

    if (!_.isNaN(parseFloat(value)) && _.isFinite(parseFloat(value))) {
      setValue(`${argName}-parsed`, parseUnits(value, tokenDecimals || 18), {
        shouldDirty: true,
      });
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
        placeholder={FALLBACK_ARG_EXAMPLES.number}
        options={{
          required: !arg.optional,
          validate: (value) => {
            if (!value) return false;
            const numericValue = parseFloat(value);

            if (!tokenDecimals) return 'No token selected';

            if (!_.isNaN(numericValue) && numericValue > 0) {
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
        <Text size='sm' variant='gray'>
          ${tokenDetails?.symbol} uses {tokenDecimals} decimals
        </Text>
      ) : (
        <Text size='sm' variant='gray'>
          Input token address
        </Text>
      )}
    </Stack>
  );
};

export default AmountWithDecimals;
