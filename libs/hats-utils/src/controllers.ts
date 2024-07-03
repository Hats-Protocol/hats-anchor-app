import { CONFIG } from '@hatsprotocol/constants';
import { Module } from '@hatsprotocol/modules-sdk';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { ControllerData, SupportedChains } from 'types';
import { explorerUrl, formatAddress } from 'utils';

import { daohausUrl, safeUrl } from './authorities';

const CodeIcon = dynamic(() => import('icons').then((i) => i.CodeIcon));
const Group = dynamic(() => import('icons').then((i) => i.Group));
const WearerIcon = dynamic(() => import('icons').then((i) => i.WearerIcon));

/**
 * Get the name and link for a controller, with an icon
 * @param extendedController an extended controller data object with contract name and ens name
 * @param moduleDetails module details object, if known module
 * @param chainId the associated chain ID
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
  const link = `${explorerUrl(chainId)}/address/${_.get(
    extendedController,
    'id',
  )}`;

  // override for safe
  if (extendedController?.contractName === 'GnosisSafeProxy') {
    return {
      name: `Safe (${formatAddress(extendedController?.id)})`,
      link: safeUrl(
        chainId as SupportedChains,
        _.get(extendedController, 'id'),
      ),
      icon: Group,
    };
  }

  // override for baal
  if (extendedController?.contractName === 'Baal') {
    return {
      name: extendedController?.contractName,
      link: daohausUrl(
        chainId as SupportedChains,
        _.get(extendedController, 'id'),
      ),
      icon,
    };
  }

  // override for claims hatter
  if (moduleDetails?.name === CONFIG.claimsHatterModuleName) {
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

  if (extendedController?.contractName) {
    // contract (etherscan) name, if verified
    return {
      name: extendedController?.contractName,
      icon,
      link,
    };
  }

  return { name: formatAddress(extendedController?.id), link, icon };
};
