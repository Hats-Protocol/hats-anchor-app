import { Module } from '@hatsprotocol/modules-sdk';
import _ from 'lodash';
import { Hex } from 'viem';

import { claimsHatterId, transformInput } from '@/lib/general';
import { decimalId } from '@/lib/hats';
import { createHatsModulesClient } from '@/lib/web3';
import { FormData, Hat, ModuleDetails } from '@/types';

export const deploySingleModule = async ({
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

export const deployOnlyClaimsHatterModule = async ({
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

export const processSingleModule = ({
  singleModuleAddress,
  storedData,
  selectedHat,
  selectedModuleDetails,
  setStoredData,
}: {
  singleModuleAddress: Hex;
  storedData?: Partial<FormData>[];
  selectedHat?: Hat;
  selectedModuleDetails?: ModuleDetails;
  setStoredData: ((v: Partial<FormData>[]) => void) | undefined;
}) => {
  const updatedHats = _.map(storedData, (hat) =>
    hat.id === _.get(selectedHat, 'id') && singleModuleAddress
      ? {
          ...hat,
          isEligibilityManual: 'Automatically',
          eligibility: singleModuleAddress,
        }
      : hat,
  );

  const updatedHatExists = _.some(updatedHats, [
    'id',
    _.get(selectedHat, 'id'),
  ]);

  if (
    !updatedHatExists &&
    _.get(selectedHat, 'id') &&
    _.get(selectedModuleDetails, 'implementationAddress')
  ) {
    updatedHats.push({
      id: _.get(selectedHat, 'id'),
      isEligibilityManual: 'Automatically',
      eligibility: _.get(selectedModuleDetails, 'implementationAddress') as Hex,
    });
  }

  setStoredData?.(updatedHats);
};

export const processClaimsHatter = ({
  claimsHatterAddress,
  setStoredData,
  storedData,
  adminHat,
}: {
  claimsHatterAddress: Hex;

  setStoredData?: (v: Partial<FormData>[]) => void;
  storedData: any;
  adminHat: any;
}) => {
  const updatedHats = _.isArray(storedData)
    ? _.map(storedData, (hat) => {
        if (hat.id === adminHat?.id && claimsHatterAddress) {
          const updatedHat = { ...hat };
          updatedHat.wearers = updatedHat.wearers || [];
          updatedHat.wearers.push({
            address: claimsHatterAddress,
            ens: '',
          });
          return updatedHat;
        }
        return hat;
      })
    : [...(storedData || [])];

  setStoredData?.(updatedHats);
};
