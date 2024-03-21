/* eslint-disable import/prefer-default-export */
import { Module } from '@hatsprotocol/modules-sdk';
import _ from 'lodash';
import { ContractData, HatWearer, SupportedChains } from 'types';
import { explorerUrl, formatAddress } from 'utils';

import { daohausUrl, safeUrl } from './authorities';

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
