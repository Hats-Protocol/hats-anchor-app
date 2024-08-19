import { KNOWN_ELIGIBILITY_MODULES } from "@hatsprotocol/constants";
import { concat, flatten } from "lodash";
import { Authority } from "types";

export const getCustomModuleFunction = (authority: Authority | undefined) => {
  const customImplementationAddresses = flatten(concat(
    KNOWN_ELIGIBILITY_MODULES.agreement,
    KNOWN_ELIGIBILITY_MODULES.allowlist,
    KNOWN_ELIGIBILITY_MODULES.election,
    KNOWN_ELIGIBILITY_MODULES.jokeRace,
    KNOWN_ELIGIBILITY_MODULES.staking,
  ))

  if (!authority?.moduleAddress || !customImplementationAddresses.includes(authority.moduleAddress)) {
    return undefined;
  }

  return authority;
};