import { AUTHORITY_TYPES } from '@hatsprotocol/constants';
import { Role, WriteFunction } from '@hatsprotocol/modules-sdk';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
import {
  AppHat,
  AppWriteFunction,
  Authority,
  HatAuthority,
  ModuleDetails,
} from 'types';
import { formatAddress } from 'utils';
import { Hex } from 'viem';

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
    const authorities: any[] = [];

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
