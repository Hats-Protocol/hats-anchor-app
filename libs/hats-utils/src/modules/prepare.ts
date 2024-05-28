import { CONFIG } from '@hatsprotocol/constants';
import {
  checkAndEncodeArgs,
  ModuleCreationArg,
  solidityToTypescriptType,
} from '@hatsprotocol/modules-sdk';
import { hatIdIpToDecimal } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
import { FormValues, ModuleDetails } from 'types';
import { getDefaultValue, transformInput } from 'utils';
import { parseUnits } from 'viem';

// TODO is `-parsed` still being used. Was previous handling for parsing ENS names
export const prepareArgs = (
  values: FormValues,
  selectedModuleDetails?: ModuleDetails,
) => {
  if (!selectedModuleDetails) {
    return { immutableArgs: [], mutableArgs: [] };
  }
  const immutableArgs = _.map(
    selectedModuleDetails.creationArgs.immutable,
    ({ name, type }: ModuleCreationArg) => {
      const valueToTransform = values[`${name}-parsed`] || values[name];

      const passedValue =
        valueToTransform === 'custom'
          ? values[`${name}_custom`]
          : valueToTransform;

      return transformInput(passedValue, type);
    },
  );
  const mutableArgs = _.map(
    selectedModuleDetails.creationArgs.mutable,
    ({ name, type }: ModuleCreationArg) => {
      const valueToTransform = values[`${name}-parsed`] || values[name];

      const passedValue =
        valueToTransform === 'custom'
          ? values[`${name}_custom`]
          : valueToTransform;

      return transformInput(passedValue, type);
    },
  );

  return { immutableArgs, mutableArgs };
};

export const prepareDeployModuleAndRegisterWithClaimsHatterArgs = ({
  selectedModuleDetails,
  isLocalFormValid,
  values,
  hatId,
  claimabilityType,
}: {
  selectedModuleDetails?: ModuleDetails;
  isLocalFormValid: boolean;
  values: FormValues;
  hatId: bigint;
  claimabilityType?: number;
}) => {
  let encodedImmutableArgs: string | undefined;
  let encodedMutableArgs: string | undefined;

  const { immutableArgs, mutableArgs } = prepareArgs(
    values,
    selectedModuleDetails,
  );

  const areArgsFilled = (args: unknown[]) => _.every(args, Boolean);
  const allArgsFilled =
    areArgsFilled(immutableArgs) && areArgsFilled(mutableArgs);

  if (selectedModuleDetails && isLocalFormValid && allArgsFilled) {
    const result = checkAndEncodeArgs({
      module: selectedModuleDetails,
      immutableArgs,
      mutableArgs,
    });
    encodedImmutableArgs = result.encodedImmutableArgs;
    encodedMutableArgs = result.encodedMutableArgs || '0x';
  }

  return [
    CONFIG.modulesRegistryFactory,
    selectedModuleDetails?.implementationAddress,
    hatId,
    encodedImmutableArgs,
    encodedMutableArgs,
    hatId,
    claimabilityType,
  ];
};

export const processValues = ({
  originalValues,
  selectedModuleDetails,
  tokenDecimals,
}: {
  originalValues: FormValues;
  selectedModuleDetails?: ModuleDetails;
  tokenDecimals?: number | undefined;
}) => {
  const newValues = { ...originalValues };

  const allArgs = [
    ...(selectedModuleDetails?.creationArgs?.immutable || []),
    ...(selectedModuleDetails?.creationArgs?.mutable || []),
  ];

  _.forEach(allArgs, (arg: ModuleCreationArg) => {
    const tsType = solidityToTypescriptType(arg.type);
    const defaultValue = getDefaultValue(tsType);

    if (arg.optional && !newValues[arg.name]) {
      newValues[arg.name] = defaultValue;
    }

    if (arg.displayType === 'amountWithDecimals') {
      const amount = newValues[arg.name] as string;
      if (
        amount !== undefined &&
        !_.isNaN(parseFloat(amount)) &&
        tokenDecimals !== undefined
      ) {
        try {
          newValues[arg.name] = parseUnits(amount, tokenDecimals);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(`Error parsing units: ${error}`);
          newValues[arg.name] = defaultValue;
        }
      }
    }

    if (arg.displayType === 'hat' && newValues[`${arg.name}_custom`]) {
      const value = newValues[`${arg.name}_custom`] as string;
      newValues[arg.name] = hatIdIpToDecimal(value.replace(/\.$/, ''));
      delete newValues[`${arg.name}_custom`];
    }
  });

  return newValues;
};
