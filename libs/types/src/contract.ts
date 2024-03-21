import { Hex } from 'viem';

import { HatDetails, HatWearer } from './hat';

export type ContractDataKeys =
  | 'compilerVersion'
  | 'constructorArguments'
  | 'contractName'
  | 'evmVersion'
  | 'implementation'
  | 'library'
  | 'licenseType'
  | 'optimizationUsed'
  | 'proxy'
  | 'runs'
  | 'swarmSource';

export type ContractData = {
  [key in ContractDataKeys]: string;
};

export type ControllerData = HatWearer & Partial<ContractData>;

export type HatsCalls = {
  hatId?: Hex;
  calls: unknown[];
  hatChanges: { [key: string]: unknown };
  detailsToPin?: HatDetails;
};
