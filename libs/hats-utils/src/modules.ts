import {
  AUTHORITY_TYPES,
  CONFIG,
  MODULE_TYPES,
  // MODULE_TYPES,
  TRIGGER_OPTIONS,
} from '@hatsprotocol/constants';
import { HsgMetadata, HsgType, Role } from '@hatsprotocol/hsg-sdk';
import {
  checkAndEncodeArgs,
  solidityToTypescriptType,
} from '@hatsprotocol/modules-sdk';
import {
  hatIdDecimalToHex,
  hatIdDecimalToIp,
  hatIdIpToDecimal,
} from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
import { FiCopy } from 'react-icons/fi';
import {
  AppHat,
  AppWriteFunction,
  FormData,
  HatAuthority,
  HatsAccount1ofN,
  HatSignerGate,
  ModuleCreationArg,
  ModuleDetails,
  SupportedChains,
  UseCustomToastReturn,
} from 'types';
import {
  createHatsModulesClient,
  explorerUrl,
  formatAddress,
  getDefaultValue,
  transformInput,
} from 'utils';
import { Hex, parseUnits } from 'viem';

import { safeUrl } from './authorities';
import { formHatUrl } from './hats';

type FormValues = { [key: string]: unknown };

export const deployModule = async ({
  selectedModuleDetails,
  selectedHat,
  address,
  chainId,
  values,
  hatId,
}: {
  selectedModuleDetails?: ModuleDetails;
  selectedHat?: AppHat;
  address?: Hex;
  values: FormValues;
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
  selectedHat?: AppHat;
  address?: Hex;
  values: FormValues;
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

export const deployClaimsHatter = async ({
  claimsHatterModule,
  selectedHat,
  address,
  values,
  chainId,
  adminHatId,
}: {
  claimsHatterModule?: ModuleDetails;
  selectedHat?: AppHat;
  address?: Hex;
  values: FormValues;
  chainId?: number;
  adminHatId: bigint;
}) => {
  if (claimsHatterModule && selectedHat?.id && address) {
    const claimsMutableArgs = [
      transformInput(values.initialClaimableHats, 'uint256[]'),
      transformInput(values.initialClaimabilityType, 'uint8[]'),
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

export const processModule = ({
  moduleAddress,
  storedData,
  selectedHat,
  type,
}: {
  moduleAddress: Hex;
  storedData?: Partial<FormData>[];
  selectedHat?: AppHat;
  type: string; // ValueOf<MODULE_TYPES>;
}) => {
  if (!selectedHat?.id || !moduleAddress) return storedData || [];
  const eligibilityValues = {
    isEligibilityManual: TRIGGER_OPTIONS.AUTOMATICALLY,
    eligibility: moduleAddress as Hex,
  };
  const toggleValues = {
    isToggleManual: TRIGGER_OPTIONS.AUTOMATICALLY,
    toggle: moduleAddress as Hex,
  };
  const hatHasChanges = _.find(storedData, { id: _.get(selectedHat, 'id') });
  // combine updated hat values, select module values by type
  const updatedHat = {
    id: _.get(selectedHat, 'id'),
    ...hatHasChanges,
    ...(type === MODULE_TYPES.eligibility && eligibilityValues),
    ...(type === MODULE_TYPES.toggle && toggleValues),
  };
  // remove current hat from stared data
  const updateStoredData = storedData?.splice(
    _.findIndex(storedData, { id: _.get(selectedHat, 'id') }),
    1,
  );

  // return stored data with updated hat
  return _.flatten(_.concat(updateStoredData, [updatedHat]));
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

  const updatedHatExists = _.find(storedData, ['id', adminId]);

  // TODO [md - edge case] handle draft case with increment wearers
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
      id: adminId as Hex,
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

export function populateModulesAuthorities({
  hatAuthorities,
  modulesDetails,
  hatDetails,
}: {
  hatAuthorities?: HatAuthority;
  modulesDetails: ModuleDetails[];
  hatDetails?: AppHat[];
}) {
  const filteredAuthorities = _.omit(hatAuthorities, [
    'hsgOwner',
    'hsgSigner',
    'hatsAccount1ofN',
  ]);
  const updatedHatAuthorities = _.map(
    filteredAuthorities,
    (authorityEntries: { id: Hex; hatId: Hex }[], authorityKey: string) =>
      _.map(authorityEntries, ({ id, hatId }: { id: Hex; hatId: Hex }) => {
        const moduleInfo = _.find(modulesDetails, { id });
        if (!moduleInfo) return null;

        const matchingRole = _.find(
          moduleInfo?.customRoles,
          (role: Role) => role.id === authorityKey,
        );
        const matchingFunctions = _.filter(
          moduleInfo?.writeFunctions,
          (func: AppWriteFunction) => _.includes(func.roles, matchingRole?.id),
        );

        let description: string = '';
        if (_.isArray(moduleInfo?.details)) {
          description = moduleInfo.details.join('\n');
        } else if (typeof moduleInfo?.details === 'string') {
          description = moduleInfo.details as string;
        }
        const hat = _.find(hatDetails, { id: hatId });

        return {
          label: `${matchingRole?.name} for ${
            hat?.detailsObject?.data.name || hat?.details
          } (#${hatIdDecimalToIp(BigInt(hatId))})`,
          link: matchingRole?.id,
          description,
          type: AUTHORITY_TYPES.modules,
          id: matchingRole?.id,
          functions: matchingFunctions as AppWriteFunction[],
          instanceAddress: id,
          moduleAddress: moduleInfo?.implementationAddress as Hex,
          moduleLabel: `${moduleInfo?.name} (${formatAddress(id as Hex)})`,
          hatId,
        };
      }),
  );

  return _.flatten(updatedHatAuthorities);
}

export const populateHatsAccountsAuthorities = ({
  details,
  hatId,
  chainId,
  predictedAddress,
  deployFn,
  toast,
}: {
  details?: HatsAccount1ofN[];
  hatId: Hex;
  chainId: SupportedChains | undefined;
  predictedAddress?: Hex | null;
  deployFn: () => void;
  toast: UseCustomToastReturn;
}) => {
  const undeployedWalletAuth = {
    label: `Control 1/N HatsAccount (${formatAddress(predictedAddress)})`,
    link: predictedAddress as string,
    description: `Wearers of this hat are able to take actions via the shared HatsAccount at [${formatAddress(
      predictedAddress,
    )}](${explorerUrl(
      chainId,
    )}/address/${predictedAddress}). This account has not yet been deployed and can be deployed permissionlessly.  
      Once deployed, any of the wearers of this hat can take full control of the assets associated with the shared account.  
      For more information about HatsAccount, see the Hats [documentation](https://github.com/Hats-Protocol/hats-account).`,
    type: AUTHORITY_TYPES.wallet,
    id: predictedAddress as string,
    instanceAddress: predictedAddress as Hex,
    functions: [
      {
        isCustom: true,
        label: 'Deploy',
        description: 'Deploy the HatsAccount authority',
        onClick: deployFn,
        primary: true,
      },
      {
        // TODO why is the "not a wearer" tooltip showing up here but not on the deployed version
        label: 'Copy Address',
        description: 'Copy the address of the HatsAccount',
        isCustom: true,
        onClick: () => {
          if (!predictedAddress) return;
          navigator.clipboard.writeText(predictedAddress); // ? HOOK WORKAROUND HERE
          toast.info({
            title: 'Successfully copied wearer address to clipboard',
          });
        },
        icon: FiCopy,
      },
    ] as unknown as AppWriteFunction[],
    hatId,
    isDeployed: false,
  };

  if (!details || details.length === 0) {
    return [undeployedWalletAuth];
  }

  return details.map((wallet) => ({
    label: `Control over 1/N HatsAccount (${formatAddress(wallet.id)})`,
    link: wallet.accountOfHat?.id as string,
    description: `Wearers of this hat are able to take actions via the shared HatsAccount account at [${formatAddress(
      wallet.id,
    )}](${explorerUrl(chainId)}/address/${wallet.id}). 
    Any of the wearers of this hat can take full control of the assets associated with the shared account.  
    For more information about HatsAccount, see the Hats [documentation](https://github.com/Hats-Protocol/hats-account).`,
    type: AUTHORITY_TYPES.wallet,
    id: wallet.id as string,
    // functions: wallet.operations,
    functions: [
      {
        label: 'Copy Address',
        description: 'Copy the address of the HatsAccount',
        isCustom: true,
        onClick: () => {
          navigator.clipboard.writeText(wallet.id);
          toast.info({
            title: 'Successfully copied wearer address to clipboard',
          });
        },
        icon: FiCopy,
      },
    ] as unknown as AppWriteFunction[],
    instanceAddress: wallet.id as Hex,
    hatId,
    isDeployed: true,
  }));
};

export const populateHatsGatesAuthorities = ({
  details,
  gates,
  role,
  chainId,
  hatId,
}: {
  details?: HatSignerGate[] | null;
  gates?: { single: HsgMetadata; multi: HsgMetadata } | null;
  role: 'hsgOwner' | 'hsgSigner';
  chainId: SupportedChains | undefined;
  hatId?: Hex;
}) => {
  if (!details || !gates || !chainId) return [];

  return details.map((gate) =>
    createHSG({ gate, role, gates, chainId, hatId }),
  );
};

const createHSG = ({
  gate,
  role,
  gates,
  chainId,
  hatId,
}: {
  gate: HatSignerGate;
  role: 'hsgOwner' | 'hsgSigner';
  gates: { single: HsgMetadata; multi: HsgMetadata };
  chainId: SupportedChains;
  hatId?: Hex;
}) => {
  const customRole = _.find(
    gates[gate.type === 'Single' ? 'single' : 'multi'].customRoles,
    { id: role },
  );
  const functions =
    role === 'hsgOwner'
      ? getOwnerFunctions(
          gate.type === 'Single'
            ? gates.single.writeFunctions
            : gates.multi.writeFunctions,
        )
      : getSignerFunctions(
          gate.type === 'Single'
            ? gates.single.writeFunctions
            : gates.multi.writeFunctions,
        );

  return {
    label: `${customRole?.name}`,
    subLabel: formatAddress(gate.safe),
    type: AUTHORITY_TYPES.hsg,
    id: gate.id,
    hsgConfig: {
      type: (gate.type === 'Single' ? 'HSG' : 'MHSG') as HsgType,
      minThreshold: gate.minThreshold,
      targetThreshold: gate.targetThreshold,
      maxSigners: gate.maxSigners,
    },
    hatId,
    functions,
    description: generateGateDescription(gate, chainId),
    instanceAddress: gate.id,
    ownerHat: gate.ownerHat,
    signerHats: gate.signerHats,
    safe: gate.safe,
  };
};

const getOwnerFunctions = (functions: AppWriteFunction[]) => {
  return _.map(functions, (func: AppWriteFunction) => {
    if (func.functionName === 'setMinThreshold') {
      return { ...func, primary: true };
    }
    return func;
  }).filter((func: AppWriteFunction) =>
    [
      'setOwnerHat',
      'removeSigner',
      'setMinThreshold',
      'setTargetThreshold',
    ].includes(func.functionName),
  );
};

const getSignerFunctions = (functions: AppWriteFunction[]) => {
  return _.map(functions, (func: AppWriteFunction) => {
    if (func.functionName === 'claimSigner') {
      return { ...func, primary: true };
    }
    return func;
  }).filter((func: AppWriteFunction) =>
    ['claimSigner', 'removeSigner'].includes(func.functionName),
  );
};

export const generateGateDescription = (
  gate: HatSignerGate,
  chainId: SupportedChains,
) => {
  const { safe, minThreshold, targetThreshold, maxSigners } = gate;

  const formattedSafe = formatAddress(safe);
  const formattedGate = formatAddress(gate.id);

  let description =
    'Wearers of this hat are able to claim signing authority on the Safe ';
  if (gate.signerHats) {
    description =
      'Wearers of this hat are able to update the Safe configuration ';
  }
  description += `([${formattedSafe}](${safeUrl(
    chainId,
    safe,
  )})) via the attached HatsSignerGate ([${formattedGate}](${explorerUrl(
    chainId,
  )}/address/${gate.id})).\n\n`;

  description += `Based on the configuration of the HatsSignerGate, this Safe:\n\n`;
  description += `- Requires a minimum of ${minThreshold} signers to execute a transaction\n\n`;
  description += `- Can have a maximum of ${maxSigners} signers\n\n`;
  description += `- Will require ${targetThreshold} signatures to execute a transaction when the number of signers is ${targetThreshold} or more\n\n`;

  if (gate.ownerHat) {
    description += `The owner of the HatsSignerGate is [Hat #${hatIdDecimalToIp(
      BigInt(gate.ownerHat.id),
    )}](${formHatUrl({
      hatId: gate.ownerHat.id,
      chainId,
    })}) in this tree.`;
  }
  if (gate.signerHats) {
    if (_.gt(_.size(gate.signerHats), 1)) {
      description += `The signers of the HSG Safe include Hats ${_.map(
        gate.signerHats,
        (h: any, i: number) =>
          // [#123.1](link), [#123.2](link), and [#123.3](link).
          `${
            i === _.size(gate.signerHats) - 1 ? 'and ' : ''
          }[#${hatIdDecimalToIp(BigInt(h.id))}](${formHatUrl({
            hatId: h.id,
            chainId,
          })})${i === _.size(gate.signerHats) - 1 ? '.' : ', '}`,
      )}`;
    } else {
      const signerHatId = _.get(_.first(gate.signerHats), 'id');
      if (!signerHatId) return description;
      description += `The signer of the HSG safe is [Hat #${hatIdDecimalToIp(
        BigInt(signerHatId),
      )}](${formHatUrl({ hatId: signerHatId, chainId })})`;
    }
  }

  return description;
};
