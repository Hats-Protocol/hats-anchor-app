import { Module } from '@hatsprotocol/modules-sdk';
import _ from 'lodash';
import { Hex } from 'viem';

import { claimsHatterId, transformInput } from '@/lib/general';
import { decimalId, decimalIdToId } from '@/lib/hats';
import { createHatsModulesClient } from '@/lib/web3';
import { FormData, Hat, ModuleDetails } from '@/types';

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
    const immutableArgs = _.map(
      selectedModuleDetails.creationArgs.immutable,
      ({ name, type }) => transformInput(values[name], type),
    );
    const mutableArgs = _.map(
      selectedModuleDetails.creationArgs.mutable,
      ({ name, type }) => transformInput(values[name], type),
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
  claimsHatterModule,
  selectedModuleDetails,
  selectedHat,
  address,
  values,
  chainId,
  hatId,
  adminHat,
}: {
  selectedModuleDetails?: ModuleDetails;
  selectedHat?: Hat;
  address?: Hex;
  claimsHatterModule?: Module;
  values: any;
  chainId?: number;
  hatId: bigint;
  adminHat: any;
}) => {
  if (
    selectedModuleDetails &&
    selectedHat?.id &&
    address &&
    claimsHatterModule
  ) {
    const immutableArgs = _.map(
      selectedModuleDetails.creationArgs.immutable,
      ({ name, type }) => transformInput(values[name], type),
    );
    const mutableArgs = _.map(
      selectedModuleDetails.creationArgs.mutable,
      ({ name, type }) => transformInput(values[name], type),
    );

    const hatsClient = await createHatsModulesClient(chainId);

    const claimsImmutableArgs = _.map(
      claimsHatterModule.creationArgs.immutable,
      ({ name, type }) => transformInput(values[name], type),
    );
    const claimsMutableArgs = _.map(
      claimsHatterModule.creationArgs.mutable,
      ({ name, type }) => transformInput(values[name], type),
    );

    return hatsClient?.batchCreateNewInstances({
      account: address,
      moduleIds: [selectedModuleDetails.id, claimsHatterId],
      hatIds: [hatId, BigInt(decimalId(adminHat))],
      immutableArgsArray: [immutableArgs, claimsImmutableArgs],
      mutableArgsArray: [mutableArgs, claimsMutableArgs],
    });
  }
  return null;
};

export const deployClaimsHatter = async ({
  claimsHatterModule,
  selectedHat,
  address,
  values,
  chainId,
  hatId,
}: {
  claimsHatterModule?: Module;
  selectedHat?: Hat;
  address?: Hex;
  values: any;
  chainId?: number;
  hatId: bigint;
}) => {
  if (claimsHatterModule && selectedHat?.id && address) {
    const claimsImmutableArgs = _.map(
      claimsHatterModule.creationArgs.immutable,
      ({ name, type }) => transformInput(values[name], type),
    );
    const claimsMutableArgs = _.map(
      claimsHatterModule.creationArgs.mutable,
      ({ name, type }) => transformInput(values[name], type),
    );

    const hatsClient = await createHatsModulesClient(chainId);

    return hatsClient?.createNewInstance({
      account: address,
      moduleId: claimsHatterId,
      hatId,
      immutableArgs: claimsImmutableArgs,
      mutableArgs: claimsMutableArgs,
    });
  }
  return null;
};

export const processModule = ({
  moduleAddress,
  storedData,
  selectedHat,
}: {
  moduleAddress: Hex;
  storedData?: Partial<FormData>[];
  selectedHat?: Hat;
  selectedModuleDetails?: ModuleDetails;
}) => {
  const updatedHats = _.isArray(storedData)
    ? _.map(storedData, (hat) =>
        hat.id === _.get(selectedHat, 'id') && moduleAddress
          ? {
              ...hat,
              isEligibilityManual: 'Automatically',
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
}: {
  claimsHatterAddress: Hex;
  storedData: any;
  adminHat: Hex;
}) => {
  const adminId = decimalIdToId(adminHat);
  const claimsHatterWearer = {
    address: claimsHatterAddress,
    ens: '',
  };

  const updatedHats = _.isArray(storedData)
    ? _.map(storedData, (hat) => {
        if (hat.id === adminId && claimsHatterAddress) {
          const updatedHat = { ...hat };
          updatedHat.wearers = updatedHat.wearers || [];
          updatedHat.wearers.push(claimsHatterWearer);
          return updatedHat;
        }
        return hat;
      })
    : [...(storedData || [])];

  const updatedHatExists = _.some(updatedHats, ['id', adminId]);

  if (claimsHatterAddress && adminId && !updatedHatExists) {
    updatedHats.push({
      id: adminId,
      wearers: [claimsHatterWearer],
    });
  }

  console.log('updatedHats', updatedHats);
  return updatedHats;
};
