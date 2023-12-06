import { checkAndEncodeArgs } from '@hatsprotocol/modules-sdk';
import { CONFIG, TRIGGER_OPTIONS } from 'app-constants';
import { createHatsModulesClient, transformInput } from 'app-utils';
import { FormData, Hat, ModuleCreationArg, ModuleDetails } from 'hats-types';
import _ from 'lodash';
import { Hex } from 'viem';

import { decimalIdToId } from './hats';

// modules-utils

export const deployModule = async ({
  selectedModuleDetails,
  selectedHat,
  address,
  chainId,
  values,
  hatId,
}: {
  selectedModuleDetails?: ModuleDetails;
  selectedHat?: Hat;
  address?: Hex;
  values: any;
  chainId?: number;
  hatId: bigint;
}) => {
  if (selectedModuleDetails && selectedHat?.id && address) {
    const { immutableArgs, mutableArgs } = prepareArgs(
      values,
      selectedModuleDetails,
    );

    const hatsClient = await createHatsModulesClient(chainId);

    return hatsClient?.createNewInstance({
      account: address,
      moduleId: selectedModuleDetails.id,
      hatId,
      immutableArgs,
      mutableArgs,
    });
  }
  return null;
};

export const deployModuleWithClaimsHatter = async ({
  selectedModuleDetails,
  claimsHatterId,
  selectedHat,
  address,
  values,
  chainId,
  hatId,
  adminHatId,
}: {
  selectedModuleDetails?: ModuleDetails;
  claimsHatterId?: Hex;
  selectedHat?: Hat;
  address?: Hex;
  values: any;
  chainId?: number;
  hatId: bigint;
  adminHatId: bigint;
}) => {
  if (
    !selectedModuleDetails ||
    !selectedHat?.id ||
    !address ||
    !claimsHatterId
  ) {
    return null;
  }
  const { immutableArgs, mutableArgs } = prepareArgs(
    values,
    selectedModuleDetails,
  );

  const hatsClient = await createHatsModulesClient(chainId);

  const claimsMutableArgs = [
    transformInput(values.initialClaimableHats, 'uint256[]'),
    transformInput(values.initialClaimabilityTypes, 'uint8[]'),
  ];

  return hatsClient?.batchCreateNewInstances({
    account: address,
    moduleIds: [selectedModuleDetails.id, claimsHatterId],
    hatIds: [hatId, adminHatId],
    immutableArgsArray: [immutableArgs, []],
    mutableArgsArray: [mutableArgs, claimsMutableArgs],
  });
};

export const prepareArgs = (
  values: any,
  selectedModuleDetails?: ModuleDetails,
) => {
  if (!selectedModuleDetails) {
    return { immutableArgs: [], mutableArgs: [] };
  }
  const immutableArgs = _.map(
    selectedModuleDetails.creationArgs.immutable,
    ({ name, type }: ModuleCreationArg) => transformInput(values[name], type),
  );
  const mutableArgs = _.map(
    selectedModuleDetails.creationArgs.mutable,
    ({ name, type }: ModuleCreationArg) => transformInput(values[name], type),
  );

  return { immutableArgs, mutableArgs };
};

export const deployClaimsHatter = async ({
  claimsHatterModule,
  selectedHat,
  address,
  values,
  chainId,
  adminHatId,
}: {
  claimsHatterModule?: ModuleDetails;
  selectedHat?: Hat;
  address?: Hex;
  values: any;
  chainId?: number;
  adminHatId: bigint;
}) => {
  if (claimsHatterModule && selectedHat?.id && address) {
    const claimsMutableArgs = [
      transformInput(values.initialClaimableHats, 'uint256[]'),
      transformInput(values.initialClaimabilityTypes, 'uint8[]'),
    ];

    const hatsClient = await createHatsModulesClient(chainId);

    return hatsClient?.createNewInstance({
      account: address,
      moduleId: claimsHatterModule?.id,
      hatId: adminHatId,
      immutableArgs: [],
      mutableArgs: claimsMutableArgs,
    });
  }
  return null;
};

// TODO handle better return strategy in these two
export const processModule = ({
  moduleAddress,
  storedData,
  selectedHat,
}: {
  moduleAddress: Hex;
  storedData?: Partial<FormData>[];
  selectedHat?: Hat;
}) => {
  const updatedHats = _.isArray(storedData)
    ? _.map(storedData, (hat: Partial<FormData>) =>
        hat.id === _.get(selectedHat, 'id') && moduleAddress
          ? {
              ...hat,
              isEligibilityManual: TRIGGER_OPTIONS.AUTOMATICALLY,
              eligibility: moduleAddress,
            }
          : hat,
      )
    : [...(storedData || [])];

  const updatedHatExists = _.some(updatedHats, [
    'id',
    _.get(selectedHat, 'id'),
  ]);

  if (!updatedHatExists && _.get(selectedHat, 'id') && moduleAddress) {
    updatedHats.push({
      id: _.get(selectedHat, 'id'),
      isEligibilityManual: 'Automatically',
      eligibility: moduleAddress as Hex,
    });
  }

  return updatedHats;
};

export const processClaimsHatter = ({
  claimsHatterAddress,
  storedData,
  adminHat,
  incrementWearers,
}: {
  claimsHatterAddress: Hex;
  storedData: Partial<FormData>[] | undefined;
  adminHat: Partial<any> | undefined; // Hat + FormData
  incrementWearers: string;
}) => {
  const adminId = decimalIdToId(adminHat?.id);
  const claimsHatterWearer = {
    address: claimsHatterAddress,
    ens: '',
  };

  const updatedHatExists = _.find(storedData, ['id', adminId]);

  // TODO handle draft case with increment wearers
  const updatedHats = _.isArray(storedData)
    ? _.map(storedData, (hat: Partial<FormData>) => {
        if (hat.id === adminId && claimsHatterAddress) {
          const maxSupply: { maxSupply?: string } = {};
          if (
            (adminHat?.currentSupply === adminHat?.maxSupply ||
              hat.maxSupply === adminHat?.maxSupply) &&
            incrementWearers === 'Yes'
          ) {
            maxSupply.maxSupply = _.toString(
              _.add(_.toNumber(_.get(adminHat, 'maxSupply')), 1),
            );
          }
          const updatedHat = { ...hat, ...maxSupply };
          updatedHat.wearers = updatedHat.wearers || [];
          updatedHat.wearers.push(claimsHatterWearer);
          return updatedHat;
        }
        return hat;
      })
    : [...(storedData || [])];

  if (claimsHatterAddress && adminId && !updatedHatExists) {
    const maxSupply: { maxSupply?: string } = {};
    if (
      adminHat?.currentSupply === adminHat?.maxSupply &&
      incrementWearers === 'Yes'
    ) {
      maxSupply.maxSupply = _.toString(
        _.add(_.toNumber(_.get(adminHat, 'maxSupply')), 1),
      );
    }
    updatedHats.push({
      id: adminId,
      wearers: [claimsHatterWearer],
      ...maxSupply,
    });
  }

  return updatedHats;
};

export const prepareDeployModuleAndRegisterWithClaimsHatterArgs = ({
  selectedModuleDetails,
  isLocalFormValid,
  values,
  hatId,
}: {
  selectedModuleDetails?: ModuleDetails;
  isLocalFormValid: boolean;
  values: { [key: string]: unknown };
  hatId: bigint;
}) => {
  let encodedImmutableArgs: string | undefined;
  let encodedMutableArgs: string | undefined;

  const { immutableArgs, mutableArgs } = prepareArgs(
    values,
    selectedModuleDetails,
  );

  const areArgsFilled = (args: any[]) => _.every(args, Boolean);
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
    1,
  ];
};
