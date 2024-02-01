import { Module } from '@hatsprotocol/modules-sdk';
import { hatIdDecimalToIp, hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { explorerUrl, formatAddress } from 'app-utils';
import { ContractData, HatWearer, SupportedChains } from 'hats-types';
import _ from 'lodash';
import { Hex } from 'viem';

export const SAFE_URL = 'https://app.safe.global';
export const DAOHAUS_URL = 'https://admin.daohaus.club';

export const SAFE_CHAIN_MAP: { [key in SupportedChains]: string } = {
  1: 'eth',
  5: 'gor',
  10: 'oeth',
  100: 'gno',
  137: 'matic',
  8453: 'base',
  42161: 'arb1',
  42220: 'celo',
  11155111: 'sep',
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

export const formHatUrl = ({
  hatId,
  chainId,
}: {
  hatId: Hex;
  chainId: SupportedChains;
}) => {
  const basePath = '/trees';
  const id = BigInt(hatId);
  const treeId = Number(hatIdToTreeId(id));
  const hatIp = hatIdDecimalToIp(id);

  return `${basePath}/${chainId}/${treeId}?hatId=${hatIp}`;
};

export const getControllerNameAndLink = ({
  extendedController,
  moduleDetails,
  contractData,
  chainId,
}: {
  extendedController: HatWearer | undefined; // toggle/eligibility data
  moduleDetails: Module | undefined;
  contractData: ContractData | undefined;
  chainId: SupportedChains | undefined;
}) => {
  // fallback values: formatted address and explorer link
  let controllerName = formatAddress(extendedController?.id);
  let controllerLink = `${explorerUrl(chainId)}/address/${_.get(
    extendedController,
    'id',
  )}`;
  // if known module, use module name
  if (moduleDetails) controllerName = moduleDetails.name;
  // prioritize ens
  else if (extendedController?.ensName)
    controllerName = extendedController?.ensName;
  else if (contractData?.contractName === 'GnosisSafeProxy') {
    // override for safe
    controllerName = 'Safe Multisig';
    controllerLink = safeUrl(
      chainId as SupportedChains,
      _.get(extendedController, 'id'),
    );
  } else if (contractData?.contractName === 'Baal') {
    // override for baal
    controllerName = contractData?.contractName;
    controllerLink = daohausUrl(
      chainId as SupportedChains,
      _.get(extendedController, 'id'),
    );
  } else if (contractData?.contractName)
    // contract (etherscan) name, if verified
    controllerName = contractData?.contractName;

  return { controllerName, controllerLink };
};
