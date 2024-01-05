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
