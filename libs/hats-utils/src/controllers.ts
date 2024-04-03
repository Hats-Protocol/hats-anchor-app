/* eslint-disable import/prefer-default-export */
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

export const getControllerNameAndLink = ({
  extendedController,
  moduleDetails,
  chainId,
}: {
  extendedController: ControllerData | undefined; // toggle/eligibility data
  moduleDetails?: Module | undefined;
  chainId: SupportedChains | undefined;
}) => {
  // fallback values: formatted address and explorer link
  let name = formatAddress(extendedController?.id);
  let link = `${explorerUrl(chainId)}/address/${_.get(
    extendedController,
    'id',
  )}`;
  let icon = extendedController?.isContract ? CodeIcon : WearerIcon;
  // if known module, use module name
  if (moduleDetails) name = moduleDetails.name;
  if (moduleDetails?.name === CONFIG.claimsHatterModuleName) {
    name = 'Autonomous Admin';
  }
  // prioritize ens
  else if (extendedController?.ensName) name = extendedController?.ensName;
  else if (extendedController?.contractName === 'GnosisSafeProxy') {
    // override for safe
    name = 'Safe Multisig';
    link = safeUrl(chainId as SupportedChains, _.get(extendedController, 'id'));
    icon = Group;
  } else if (extendedController?.contractName === 'Baal') {
    // override for baal
    name = extendedController?.contractName;
    link = daohausUrl(
      chainId as SupportedChains,
      _.get(extendedController, 'id'),
    );
  } else if (extendedController?.contractName)
    // contract (etherscan) name, if verified
    name = extendedController?.contractName;

  return { name, link, icon };
};
