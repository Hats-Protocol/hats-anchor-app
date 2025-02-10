import { CONTROLLER_TYPES, TRIGGER_OPTIONS } from '@hatsprotocol/constants';
import { hatIdDecimalToHex } from '@hatsprotocol/sdk-v1-core';
import { add, concat, find, flatten, get, isArray, map, reject, toString } from 'lodash';
import { AppHat, FormData, FormValues, ModuleDetails } from 'types';
import { createHatsModulesClient, transformInput } from 'utils';
import { Hex, WalletClient } from 'viem';

import { prepareArgs } from './prepare';

export const deployModule = async ({
  selectedModuleDetails,
  selectedHat,
  address,
  chainId,
  values,
  hatId,
  walletClient,
}: {
  selectedModuleDetails?: ModuleDetails;
  selectedHat?: AppHat;
  address?: Hex;
  values: FormValues;
  chainId?: number;
  hatId: bigint;
  walletClient?: WalletClient;
}) => {
  if (!selectedModuleDetails || !selectedHat?.id || !address) return null;

  const { immutableArgs, mutableArgs } = prepareArgs(values, selectedModuleDetails);

  const hatsClient = await createHatsModulesClient(chainId, walletClient);

  return hatsClient?.createNewInstance({
    account: address,
    moduleId: selectedModuleDetails.id,
    hatId,
    immutableArgs,
    mutableArgs,
  });
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
  walletClient,
}: {
  selectedModuleDetails?: ModuleDetails;
  claimsHatterId?: Hex;
  selectedHat?: AppHat;
  address?: Hex;
  values: FormValues;
  chainId?: number;
  hatId: bigint;
  adminHatId: bigint;
  walletClient?: WalletClient;
}) => {
  if (!selectedModuleDetails?.id || !selectedHat?.id || !address || !claimsHatterId) {
    return null;
  }
  const { immutableArgs, mutableArgs } = prepareArgs(values, selectedModuleDetails);

  const hatsClient = await createHatsModulesClient(chainId, walletClient);

  const claimsMutableArgs = [
    transformInput(values.initialClaimableHats, 'uint256[]'),
    transformInput(values.initialClaimabilityType, 'uint8[]'),
  ];

  return hatsClient?.batchCreateNewInstances({
    account: address,
    moduleIds: [selectedModuleDetails.id, claimsHatterId],
    hatIds: [hatId, adminHatId],
    immutableArgsArray: [immutableArgs, []],
    mutableArgsArray: [mutableArgs, claimsMutableArgs],
  });
};

export const deployClaimsHatter = async ({
  claimsHatterModule,
  selectedHat,
  address,
  values,
  chainId,
  adminHatId,
  walletClient,
}: {
  claimsHatterModule?: ModuleDetails;
  selectedHat?: AppHat;
  address?: Hex;
  values: FormValues;
  chainId?: number;
  adminHatId: bigint;
  walletClient?: WalletClient;
}) => {
  if (claimsHatterModule && selectedHat?.id && address) {
    const claimsMutableArgs = [
      transformInput(values.initialClaimableHats, 'uint256[]'),
      transformInput(values.initialClaimabilityType, 'uint8[]'),
    ];

    const hatsClient = await createHatsModulesClient(chainId, walletClient);

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

// //////////////////////
// Post Deploy Processors
// //////////////////////

export const processModule = ({
  moduleAddress,
  storedData,
  selectedHat,
  type,
}: {
  moduleAddress: Hex;
  storedData?: Partial<FormData>[];
  selectedHat?: AppHat;
  type: string; // ValueOf<CONTROLLER_TYPES>;
}) => {
  if (!selectedHat?.id || !moduleAddress) return storedData || [];
  const eligibilityValues = {
    isEligibilityManual: TRIGGER_OPTIONS.AUTOMATICALLY,
    eligibility: moduleAddress as Hex,
    'eligibility-input': moduleAddress as Hex,
  };
  const toggleValues = {
    isToggleManual: TRIGGER_OPTIONS.AUTOMATICALLY,
    toggle: moduleAddress as Hex,
    'toggle-input': moduleAddress as Hex,
  };
  const hatHasChanges = find(storedData, { id: get(selectedHat, 'id') });
  // combine updated hat values, select module values by type
  const updatedHat = {
    id: get(selectedHat, 'id'),
    ...hatHasChanges,
    ...(type === CONTROLLER_TYPES.eligibility && eligibilityValues),
    ...(type === CONTROLLER_TYPES.toggle && toggleValues),
  };
  // remove current hat from stared data
  const updateStoredData = reject(storedData, {
    id: get(selectedHat, 'id'),
  });

  // return stored data with updated hat
  return flatten(concat(updateStoredData, [updatedHat]));
};

// TODO better return strategy
export const processClaimsHatter = ({
  claimsHatterAddress,
  storedData,
  adminHat,
  incrementWearers,
}: {
  claimsHatterAddress: Hex;
  storedData: Partial<FormData>[] | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adminHat: any | undefined; // Hat + FormData
  incrementWearers: string | undefined;
}) => {
  if (!adminHat?.id) return storedData || [];

  const adminId = hatIdDecimalToHex(BigInt(adminHat?.id));
  const claimsHatterWearer = {
    address: claimsHatterAddress,
    ens: '',
  };

  const updatedHatExists = find(storedData, ['id', adminId]);

  // TODO [md - edge case] handle draft case with increment wearers
  let updatedHats: Partial<FormData>[] = [];
  if (isArray(storedData)) {
    updatedHats = map(storedData, (hat: Partial<FormData>) => {
      if (hat.id !== adminId && claimsHatterAddress) {
        return hat;
      }
      const maxSupply: { maxSupply?: string } = {};
      if (
        (adminHat?.currentSupply === adminHat?.maxSupply || hat.maxSupply === adminHat?.maxSupply) &&
        incrementWearers === 'Yes'
      ) {
        maxSupply.maxSupply = toString(add(Number(adminHat?.maxSupply), 1));
      }
      const updatedHat = { ...hat, ...maxSupply };
      updatedHat.wearers = updatedHat.wearers || [];
      updatedHat.wearers.push(claimsHatterWearer);
      return updatedHat;
    });
  } else {
    updatedHats = [...(storedData || [])];
  }

  if (claimsHatterAddress && adminId && !updatedHatExists) {
    const maxSupply: { maxSupply?: string } = {};
    if (adminHat?.currentSupply === adminHat?.maxSupply && incrementWearers === 'Yes') {
      maxSupply.maxSupply = toString(add(Number(adminHat?.maxSupply), 1));
    }
    updatedHats.push({
      id: adminId as Hex,
      wearers: [claimsHatterWearer],
      ...maxSupply,
    });
  }

  return updatedHats;
};
