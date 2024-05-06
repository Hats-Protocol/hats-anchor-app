import { AUTHORITY_TYPES } from '@hatsprotocol/constants';
import { HsgMetadata, HsgType, Role } from '@hatsprotocol/hsg-sdk';
import { WriteFunction } from '@hatsprotocol/modules-sdk';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
import { FiCopy } from 'react-icons/fi';
import {
  AppHat,
  AppWriteFunction,
  Authority,
  HatAuthority,
  HatsAccount1ofN,
  HatSignerGate,
  ModuleDetails,
  SupportedChains,
  UseCustomToastReturn,
} from 'types';
import { explorerUrl, formatAddress } from 'utils';
import { Hex } from 'viem';

import { safeUrl } from '../authorities';
import { formHatUrl } from '../hats';

/**
 * Transforms a role and hat into a string representing the role for the hat's eligibility or toggle module
 * @param role a role object that has authority for another hat's module
 * @param hatInfo hat associated with the role
 * @returns string representing the role for the hat's eligibility or toggle module
 */
const moduleRoleString = (role: Partial<Role>, hatInfo: AppHat) => {
  return `${role?.name} for ${
    hatInfo?.detailsObject?.data.name || hatInfo?.details
  } (#${hatIdDecimalToIp(BigInt(hatInfo?.id))})`;
};

const populateModuleAuthority = ({
  role,
  hat,
  functions,
  moduleInfo,
  label,
  description,
}: {
  role: Role;
  hat: AppHat;
  functions: AppWriteFunction[];
  moduleInfo: ModuleDetails;
  label?: string;
  description: string;
}) => ({
  label: label || moduleRoleString(role, hat),
  link: role?.id,
  description,
  type: AUTHORITY_TYPES.modules,
  id: role?.id,
  functions: functions as AppWriteFunction[],
  instanceAddress: moduleInfo?.id,
  moduleAddress: moduleInfo?.implementationAddress as Hex,
  moduleLabel: `${moduleInfo?.name} (${formatAddress(moduleInfo?.id as Hex)})`,
  hatId: hat?.id,
});

// TODO modules can be either type, support generically checking

/**
 * Translates a given authority key into an authority or array of authorities for the given module and hat
 * @param authorityKey key for the authority being translated
 * @param moduleInfo module details for the authority
 * @param hatInfo hat details for the authority's associated hat
 * @returns an authority or array of authorities for the given module and hat
 */
const mapModuleAuthority = ({
  authorityKey,
  moduleInfo,
  hatInfo,
}: {
  authorityKey: string;
  moduleInfo: ModuleDetails;
  hatInfo: AppHat;
}): Authority | Authority[] => {
  const matchingRole = _.find(
    moduleInfo?.customRoles,
    (role: Role) => role.id === authorityKey,
  );
  if (!matchingRole) return [];
  const matchingFunctions = _.filter(
    moduleInfo?.writeFunctions,
    (func: AppWriteFunction) => _.includes(func.roles, matchingRole?.id),
  ) as AppWriteFunction[];

  let description: string = '';
  if (_.isArray(moduleInfo?.details)) {
    description = moduleInfo.details.join('\n');
  } else if (typeof moduleInfo?.details === 'string') {
    description = moduleInfo.details as string;
  }

  // check the passthrough module for which type
  if (moduleInfo.name === 'Passthrough Module') {
    const { toggle, eligibility } = _.pick(hatInfo, ['toggle', 'eligibility']);
    const authorities = [];

    if (moduleInfo.id === toggle) {
      const localFunctions = _.map(
        _.filter(matchingFunctions, {
          functionName: 'setHatStatus',
        }),
        // TEMP extra map for overriding primary action on toggle authority card
        (func: WriteFunction) => ({
          ...func,
          primary: true,
        }),
      ) as unknown as AppWriteFunction[];
      authorities.push(
        populateModuleAuthority({
          role: matchingRole,
          hat: hatInfo,
          functions: localFunctions,
          moduleInfo,
          description,
          label: moduleRoleString({ name: 'Toggle Passthrough' }, hatInfo),
        }),
      );
    }
    if (moduleInfo.id === eligibility) {
      authorities.push(
        populateModuleAuthority({
          role: matchingRole,
          hat: hatInfo,
          functions: _.filter(matchingFunctions, {
            functionName: 'setHatWearerStatus',
          }),
          moduleInfo,
          description,
          label: moduleRoleString({ name: 'Eligibility Passthrough' }, hatInfo),
        }),
      );
    }

    return authorities;
  }

  return populateModuleAuthority({
    role: matchingRole,
    hat: hatInfo,
    functions: matchingFunctions,
    moduleInfo,
    description,
  });
};

type AuthorityEntry = {
  id: Hex;
  hatId: Hex;
};

/**
 * Maps a list of authority entries to a list of authorities for a set of modules
 * @param authorityEntries list of authority entries to be mapped
 * @param authorityKey key for the authority being translated
 * @param modulesDetails list of module details for the hat
 * @param hatDetails list of hat details for the tree
 * @returns list of authorities for the given modules
 */
const mapModuleAuthorities = ({
  authorityEntries,
  authorityKey,
  modulesDetails,
  hatDetails,
}: {
  authorityEntries: AuthorityEntry[];
  authorityKey: string;
  modulesDetails: ModuleDetails[];
  hatDetails: AppHat[];
}): Authority[] =>
  // extra flatten here to handle the case where a module is both eligibility and toggle
  _.flatten(
    _.map(authorityEntries, ({ id, hatId }: AuthorityEntry) => {
      const moduleInfo = _.find(modulesDetails, { id });
      const hatInfo = _.find(hatDetails, { id: hatId });
      if (!moduleInfo || !hatInfo) return null; // TODO handle hats outside the current tree!
      return mapModuleAuthority({ authorityKey, moduleInfo, hatInfo });
    }),
  ) as Authority[];

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
  if (!hatDetails || !modulesDetails) return [];
  const updatedHatAuthorities = _.map(
    filteredAuthorities,
    (authorityEntries: AuthorityEntry[], authorityKey: string) =>
      mapModuleAuthorities({
        authorityEntries,
        authorityKey,
        modulesDetails,
        hatDetails,
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
    createHSGAuthority({ gate, role, gates, chainId, hatId }),
  );
};

const createHSGAuthority = ({
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
  const ownerFns = [
    'setOwnerHat',
    'removeSigner',
    'setMinThreshold',
    'setTargetThreshold',
  ];

  return _.filter(
    _.map(functions, (func: AppWriteFunction) => {
      if (func.functionName === 'setMinThreshold') {
        return { ...func, primary: true };
      }
      return func;
    }),
    (func: AppWriteFunction) => _.includes(ownerFns, func.functionName),
  );
};

const getSignerFunctions = (functions: AppWriteFunction[]) => {
  const signerFns = ['claimSigner', 'removeSigner'];
  return _.filter(
    _.map(functions, (func: AppWriteFunction) => {
      if (func.functionName === 'claimSigner') {
        return { ...func, primary: true };
      }
      return func;
    }),
    (func: AppWriteFunction) => _.includes(signerFns, func.functionName),
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
