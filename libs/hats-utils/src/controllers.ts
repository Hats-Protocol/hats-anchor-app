import { CONFIG } from '@hatsprotocol/config';
import { Module } from '@hatsprotocol/modules-sdk';
import { CodeIcon, GroupIcon as Group, WearerIcon } from 'icons';
import { get, includes } from 'lodash';
import { ControllerData, SupportedChains } from 'types';
import { explorerUrl, formatAddress } from 'utils';

import { daohausUrl, safeUrl } from './authorities';

const EXCLUDE_CONTRACT_NAMES = ['MetaMultiSigWallet'];

// TODO remove dynamic imports, next imports

/**
 * Get the name and link for a controller, with an icon
 * @param extendedController - an extended controller data object with contract name and ens name
 * @param moduleDetails - module details object, if known module
 * @param chainId - the associated chain ID
 * @returns a name and link for the controller, with an icon
 */
export const getControllerNameAndLink = ({
  extendedController,
  moduleDetails,
  chainId,
}: {
  extendedController: ControllerData | undefined; // toggle/eligibility data
  moduleDetails?: Module | undefined;
  chainId: SupportedChains | undefined;
}) => {
  // default values
  const icon = extendedController?.isContract ? CodeIcon : WearerIcon;
  const link = `${explorerUrl(chainId)}/address/${get(extendedController, 'id')}`;

  // override for safe
  if (extendedController?.contractName === 'GnosisSafeProxy') {
    return {
      name: `Safe (${formatAddress(extendedController?.id)})`,
      link: safeUrl(chainId as SupportedChains, get(extendedController, 'id')),
      icon: Group,
    };
  }

  // override for baal
  if (extendedController?.contractName === 'Baal') {
    return {
      name: extendedController?.contractName,
      link: daohausUrl(chainId as SupportedChains, get(extendedController, 'id')),
      icon,
    };
  }

  // override for claims hatter
  if (
    moduleDetails?.implementationAddress === CONFIG.modules.claimsHatterV1 ||
    moduleDetails?.implementationAddress === CONFIG.modules.claimsHatterV2
  ) {
    return {
      name: 'Autonomous Admin',
      icon,
      link,
    };
  }

  // if known module, use module name
  if (moduleDetails) {
    return { name: moduleDetails.name, icon, link };
  }

  // prioritize ens
  if (extendedController?.ensName) {
    return {
      name: extendedController?.ensName,
      icon,
      link,
    };
  }

  if (extendedController?.contractName && !includes(EXCLUDE_CONTRACT_NAMES, extendedController.contractName)) {
    // contract (etherscan) name, if verified
    return {
      name: extendedController.contractName,
      icon,
      link,
    };
  }

  return { name: formatAddress(extendedController?.id), link, icon };
};
