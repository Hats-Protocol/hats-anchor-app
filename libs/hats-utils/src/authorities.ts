import { DAOHAUS_URL, SAFE_CHAIN_MAP, SAFE_URL } from '@hatsprotocol/config';
import { AUTHORITY_TYPES } from '@hatsprotocol/constants';
import { ModuleParameter } from '@hatsprotocol/modules-sdk';
import { compact, concat, filter, find, includes, map, pick, reject } from 'lodash';
import { Authority, AuthorityType, SupportedChains } from 'types';
import { Hex } from 'viem';

/**
 * Combines authorities from different sources into single source
 * @param authorities - authorities returned from the details object
 * @param guildRoles - authorities found for the hat at Guild
 * @param spaces - authorities found for the hat at Snapshot
 * @param modulesAuthorities - authorities found for the hat's modules
 * @returns object with `data` property containing the combined authorities
 */
export const combineAuthorities = ({
  authorities,
  guildRoles,
  spaces,
  modulesAuthorities,
}: {
  authorities: Authority[] | undefined;
  guildRoles: Authority[] | undefined;
  spaces: Authority[] | undefined;
  modulesAuthorities: Authority[] | undefined;
}): { data: Authority[] | undefined } => {
  if (!modulesAuthorities) return { data: authorities };
  const socialAuthorities = map(authorities, (authority: Authority) => ({
    ...authority,
    type: AUTHORITY_TYPES.manual as AuthorityType,
  }));

  // authorities with matching link
  const matchingAuthorities = filter(
    socialAuthorities,
    (authority: Authority) =>
      includes(map(guildRoles, 'link'), authority.link) || includes(map(spaces, 'link'), authority.link),
  );
  const mergedAuthorities = map(matchingAuthorities, (authority: Authority) => {
    const guildRole = find(guildRoles, ['link', authority.link]);
    const guildProps = pick(guildRole, ['gate', 'type']);
    const space = find(spaces, ['link', authority.link]);
    const spaceProps = pick(space, ['gate', 'type']);
    return {
      ...authority,
      ...guildProps,
      ...spaceProps,
    };
  });
  // authorities without matching link
  const ecosystemAuthorities = reject(concat(guildRoles, spaces), (authority: Authority) =>
    includes(map(socialAuthorities, 'link'), authority?.link),
  );

  // authorities that aren't in guildRoles or spaces
  const filteredAuthorities = reject(socialAuthorities, (authority: Authority) =>
    includes(map(matchingAuthorities, 'link'), authority.link),
  );

  // combine authorities
  const combined = concat(modulesAuthorities, mergedAuthorities, ecosystemAuthorities, filteredAuthorities);

  return { data: compact(combined) as Authority[] };
};

// TODO this was used in election eligibility, currently unused
/**
 * Finds the current term end value from the provided module parameters
 * @param parameters - module parameters for the attached module
 * @returns the current term end value or null if not found
 */
export const findCurrentTermEndValue = (parameters: ModuleParameter[]) => {
  if (!parameters) return null;
  const currentTermEndObj = parameters.find((param) => param.label === 'Current Term End');
  return currentTermEndObj ? new Date(Number(currentTermEndObj.value) * 1000) : null;
};

/**
 * Creates a URL for the Safe app. Generally used for controllers and wearers.
 * @param chainId the chainId of the Safe
 * @param address the address of the Safe
 * @returns a string URL for the Safe app
 */
export const safeUrl = (chainId: SupportedChains | undefined, address: Hex | undefined) => {
  if (!chainId || !address) return '';
  return `${SAFE_URL}/home?safe=${SAFE_CHAIN_MAP[chainId]}:${address}`;
};

/**
 * Creates a URL for the DaoHaus app. Generally used for DAOs.
 * @param chainId the chainId of the DAO
 * @param address the address of the DAO
 * @returns a string URL for the DaoHaus app
 */
export const daohausUrl = (chainId: SupportedChains, address: Hex | undefined) => {
  if (!chainId || !address) return '';
  return `${DAOHAUS_URL}/#/molochv3/0x${chainId.toString(16)}/${address}`;
};
