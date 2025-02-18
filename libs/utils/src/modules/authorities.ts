import { KNOWN_ELIGIBILITY_MODULES } from '@hatsprotocol/constants';
import { concat, find, flatten, keys } from 'lodash';
import { Authority } from 'types';
import { Hex } from 'viem';

export const getCustomModuleFunction = (authority: Authority | undefined) => {
  const customImplementationAddresses = flatten(
    concat(
      KNOWN_ELIGIBILITY_MODULES.agreement,
      KNOWN_ELIGIBILITY_MODULES.allowlist,
      KNOWN_ELIGIBILITY_MODULES.election,
      KNOWN_ELIGIBILITY_MODULES.jokeRace,
      KNOWN_ELIGIBILITY_MODULES.staking,
      KNOWN_ELIGIBILITY_MODULES.erc20,
      KNOWN_ELIGIBILITY_MODULES.erc721,
      KNOWN_ELIGIBILITY_MODULES.erc1155,
      KNOWN_ELIGIBILITY_MODULES.unlock,
      KNOWN_ELIGIBILITY_MODULES.passthrough,
    ),
  );

  if (!authority?.moduleAddress || !customImplementationAddresses.includes(authority.moduleAddress)) {
    return undefined;
  }

  return authority;
};

export const getKnownEligibilityModule = (implementationAddress: Hex) => {
  const knownModuleKeys = keys(KNOWN_ELIGIBILITY_MODULES);
  const knownModuleKey = find(knownModuleKeys, (key) => KNOWN_ELIGIBILITY_MODULES[key].includes(implementationAddress));

  return knownModuleKey;
};
