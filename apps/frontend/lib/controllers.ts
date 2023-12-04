import { Module } from '@hatsprotocol/modules-sdk';
import { HatWearer } from 'hats-types';
import _ from 'lodash';
import { Hex } from 'viem';

import { ContractData } from '../hooks/useContractData';
import { explorerUrl, SupportedChains } from './chains';
import { formatAddress } from './general';

export const SAFE_URL = 'https://app.safe.global';
export const DAOHAUS_URL = 'https://admin.daohaus.club';

export const SAFE_CHAIN_MAP: { [key in SupportedChains]: string } = {
  1: 'eth',
  5: 'gor',
  10: 'oeth',
  100: 'gno',
  137: 'matic',
  424: 'pgn', // NOT ACTUALLY SUPPORTED YET
  42161: 'arb1',
};

export const safeUrl = (chainId: SupportedChains, address: Hex | undefined) => {
  if (!chainId || !address) return '';
  return `${SAFE_URL}/home?safe=${SAFE_CHAIN_MAP[chainId]}:${address}`;
};

export const daohausUrl = (
  chainId: SupportedChains,
  address: Hex | undefined,
) => {
  if (!chainId || !address) return '';
  return `${DAOHAUS_URL}/#/molochv3/0x${chainId.toString(16)}/${address}`;
};

export const getControllerNameAndLink = ({
  controllerData,
  moduleDetails,
  contractData,
  chainId,
}: {
  controllerData: HatWearer | undefined; // toggle/eligibility data
  moduleDetails: Module | undefined;
  contractData: ContractData | undefined;
  chainId: SupportedChains | undefined;
}) => {
  // fallback values: formatted address and explorer link
  let controllerName = formatAddress(controllerData?.id);
  let controllerLink = `${explorerUrl(chainId)}/address/${_.get(
    controllerData,
    'id',
  )}`;
  // if known module, use module name
  if (moduleDetails) controllerName = moduleDetails.name;
  // prioritize ens
  else if (controllerData?.ensName) controllerName = controllerData?.ensName;
  else if (contractData?.contractName === 'GnosisSafeProxy') {
    // override for safe
    controllerName = 'Safe Multisig';
    controllerLink = safeUrl(
      chainId as SupportedChains,
      _.get(controllerData, 'id'),
    );
  } else if (contractData?.contractName === 'Baal') {
    // override for baal
    controllerName = contractData?.contractName;
    controllerLink = daohausUrl(
      chainId as SupportedChains,
      _.get(controllerData, 'id'),
    );
  } else if (contractData?.contractName)
    // contract (etherscan) name, if verified
    controllerName = contractData?.contractName;

  return { controllerName, controllerLink };
};
