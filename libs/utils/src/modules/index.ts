import { CONTROLLER_TYPES } from '@hatsprotocol/constants';
import { ModuleParameter, Ruleset } from '@hatsprotocol/modules-sdk';
import { filter, first, get, includes, nth } from 'lodash';
import { AllowlistProfile, AppHat, ModuleDetails, ValueOf } from 'types';
import { Hex } from 'viem';

import { viemPublicClient } from '../web3';

export * from './authorities';
export * from './input';
export * from './tokens';

export type ModuleDetailsHandler = {
  moduleDetails?: ModuleDetails;
  moduleParameters?: ModuleParameter[];
  ruleSets?: Ruleset[] | undefined;
  chainId: number | undefined;
  wearer: Hex | undefined;
  selectedHat?: AppHat;
  moduleType?: ValueOf<typeof CONTROLLER_TYPES>;
  isWearer?: boolean;
};

type FallbackModuleResult = {
  eligible: boolean;
  standing: boolean;
};

export const fallbackModuleCheck = async ({
  moduleDetails,
  chainId,
  wearer,
  selectedHat,
}: ModuleDetailsHandler): Promise<FallbackModuleResult | undefined> => {
  if (
    !moduleDetails?.abi ||
    !wearer ||
    !selectedHat?.id ||
    !selectedHat?.eligibility ||
    !chainId
  ) {
    return Promise.resolve(undefined);
  }
  return viemPublicClient(chainId)
    .readContract({
      address: selectedHat.eligibility,
      abi: moduleDetails?.abi,
      functionName: 'getWearerStatus',
      args: [wearer, selectedHat.id],
    })
    .then(async (result: unknown) => {
      const localResult = result as [boolean, boolean];
      const eligible = first(localResult) || false;
      const standing = nth(localResult, 1) || true;
      return Promise.resolve({ eligible, standing });
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Error fetching wearer status', error);
      return Promise.resolve(undefined);
    });
};

// const fetchAllowlistForWearer = async ({
//   moduleDetails,
//   chainId,
//   wearer,
// }: {
//   moduleDetails?: ModuleDetails;
//   chainId: number;
//   wearer: Hex | undefined;
// }): Promise<boolean | undefined> => {
//   return readContract({
//     address: moduleDetails?.id as Hex,
//     abi: moduleDetails?.abi,
//     chainId,
//     functionName: 'allowlist',
//     args: [wearer],
//   })
//     .then((result) => {
//       console.log('fetchAllowlistForWearer result', result);
//       return Promise.resolve(result as boolean | undefined);
//     })
//     .catch((error) => {
//       console.error('Error fetching allowlist status', error);
//       return Promise.resolve(undefined);
//     });
// };

export const filterProfiles = ({
  allowlistProfiles,
  wearerIds,
}: {
  allowlistProfiles: AllowlistProfile[];
  wearerIds: Hex[];
}) => {
  const eligible =
    (filter(allowlistProfiles, (p) => {
      return get(p, 'eligible') && !get(p, 'badStanding');
    }) as AllowlistProfile[]) || [];
  const contracts = filter(allowlistProfiles, { isContract: true }) || [];
  const multiSigs =
    filter(allowlistProfiles, {
      contractName: 'GnosisSafeProxy',
    }) || [];
  const humanistic = filter(allowlistProfiles, { isContract: false }) || [];

  const wearerProfiles =
    filter(allowlistProfiles, (p) => includes(wearerIds, p.id)) || [];
  const unclaimed =
    filter(allowlistProfiles, (p) => !includes(wearerIds, p.id)) || [];

  const goodStanding = filter(allowlistProfiles, { badStanding: false }) || [];
  const badStanding = filter(allowlistProfiles, { badStanding: true }) || [];

  return {
    all: allowlistProfiles,
    eligible,
    contracts,
    multiSigs,
    humanistic,
    wearer: wearerProfiles,
    unclaimed,
    goodStanding,
    badStanding,
  };
};
