import { HsgMetadata, HsgType, Role } from '@hatsprotocol/hsg-sdk';
import {
  checkAndEncodeArgs,
  solidityToTypescriptType,
  WriteFunction,
} from '@hatsprotocol/modules-sdk';
import { hatIdDecimalToHex, hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { AUTHORITY_TYPES, CONFIG, TRIGGER_OPTIONS } from 'app-constants';
import {
  createHatsModulesClient,
  explorerUrl,
  formatAddress,
  getDefaultValue,
  transformInput,
} from 'app-utils';
import {
  AppHat,
  Authority,
  FormData,
  HatAuthority,
  HatSignerGate,
  ModuleCreationArg,
  ModuleDetails,
  SupportedChains,
} from 'hats-types';
import _ from 'lodash';
import { ipToHatId } from 'shared-utils';
import { Hex, parseUnits } from 'viem';

import { formHatUrl, safeUrl } from './controllers';
import { decimalId } from './hats';

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
  selectedHat?: AppHat;
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
  selectedHat?: AppHat;
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
  selectedHat?: AppHat;
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
  const adminId = hatIdDecimalToHex(BigInt(adminHat?.id));
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

export const processValues = ({
  originalValues,
  selectedModuleDetails,
  tokenDecimals,
}: {
  originalValues: any;
  selectedModuleDetails?: ModuleDetails;
  tokenDecimals?: any;
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
      const amount = newValues[arg.name];
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
      const value = newValues[`${arg.name}_custom`];
      newValues[arg.name] = decimalId(ipToHatId(value));
      delete newValues[`${arg.name}_custom`];
    }
  });

  return newValues;
};

export function populateModulesAuthorities({
  hatAuthorities,
  modulesDetails,
}: {
  hatAuthorities?: HatAuthority;
  modulesDetails: ModuleDetails[];
}) {
  const updatedHatAuthorities: Authority[] = [];

  _.forEach(modulesDetails, (details: ModuleDetails) => {
    _.forEach(
      hatAuthorities,
      (authorityEntries: { id: Hex }[], authorityKey: string) => {
        const matchingRoles = _.filter(
          details?.customRoles,
          (role: Role) => role.id === authorityKey,
        );
        const matchingFunctions = _.filter(
          details.writeFunctions,
          (func: WriteFunction) =>
            _.some(matchingRoles, (role: Role) =>
              _.includes(func.roles, role.id),
            ),
        );

        let description: string;
        if (_.isArray(details.details)) {
          description = details.details.join('\n');
        } else if (typeof details.details === 'string') {
          description = details.details as string;
        }

        const transformedAuthorities = authorityEntries.map(
          (item: { id: Hex }) => {
            const role = _.head(matchingRoles);
            if (role) {
              return {
                label: `${role.name} (${formatAddress(item.id)})`,
                link: role.id,
                description,
                type: AUTHORITY_TYPES.modules,
                id: role.id,
                functions: matchingFunctions,
                instanceAddress: item.id,
                moduleAddress: details.implementationAddress as Hex,
                moduleLabel: `${details.name} (${formatAddress(
                  item.id as Hex,
                )})`,
              };
            }
            return null;
          },
        );

        const filteredAuthorities = _.compact(transformedAuthorities);
        updatedHatAuthorities.push(...filteredAuthorities);
      },
    );
  });

  return updatedHatAuthorities;
}

export const populateHatsGatesAuthorities = ({
  details,
  gates,
  role,
  chainId,
}: {
  details?: HatSignerGate[] | null;
  gates?: { single: HsgMetadata; multi: HsgMetadata } | null;
  role: 'hsgOwner' | 'hsgSigner';
  chainId: SupportedChains;
}) => {
  if (!details || !gates) return [];

  return details.map((gate) => createHSG({ gate, role, gates, chainId }));
};

const createHSG = ({
  gate,
  role,
  gates,
  chainId,
}: {
  gate: HatSignerGate;
  role: 'hsgOwner' | 'hsgSigner';
  gates: { single: HsgMetadata; multi: HsgMetadata };
  chainId: SupportedChains;
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
    label: `${customRole?.name} (${formatAddress(gate.id)})`,
    type: AUTHORITY_TYPES.hsg,
    id: gate.id,
    functions,
    description: generateGateDescription(gate, chainId),
    instanceAddress: gate.id,
    hgsType: (gate.type === 'Single' ? 'HSG' : 'MHSG') as HsgType,
    ownerHat: gate.ownerHat,
    signerHats: gate.signerHats,
    safe: gate.safe,
  };
};

const getOwnerFunctions = (functions: WriteFunction[]) => {
  return _.map(functions, (func: WriteFunction) => {
    if (func.functionName === 'setMinThreshold') {
      return { ...func, primary: true };
    }
    return func;
  }).filter((func: WriteFunction) =>
    [
      'setOwnerHat',
      'removeSigner',
      'setMinThreshold',
      'setTargetThreshold',
    ].includes(func.functionName),
  );
};

const getSignerFunctions = (functions: WriteFunction[]) => {
  return _.map(functions, (func: WriteFunction) => {
    if (func.functionName === 'claimSigner') {
      return { ...func, primary: true };
    }
    return func;
  }).filter((func: WriteFunction) =>
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
        (h, i) =>
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
