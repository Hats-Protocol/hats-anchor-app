import { CONTROLLER_TYPES } from '@hatsprotocol/constants';
import { ModuleParameter, Ruleset } from '@hatsprotocol/modules-sdk';
import _ from 'lodash';
import { AppHat, ModuleDetails, ValueOf } from 'types';
import { Hex } from 'viem';

import { viemPublicClient } from '../web3';

export * from './input';
export * from './safe';
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
      const eligible = _.first(localResult) || false;
      const standing = _.nth(localResult, 1) || true;
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
