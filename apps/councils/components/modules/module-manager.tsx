import { Module, ModuleParameter } from '@hatsprotocol/modules-sdk';
import { has } from 'lodash';
import { ReactNode } from 'react';
import { ModuleDetails, OffchainCouncilData, SupportedChains } from 'types';
import { getKnownEligibilityModule } from 'utils';
import { Hex } from 'viem';

import { AgreementManager } from './agreement-manager';
import { AllowlistManager } from './allowlist-manager';

export type ModuleManagerComponent = ({
  m,
  chainId,
  criteriaModule,
  offchainCouncilDetails,
}: {
  m: ModuleDetails;
  chainId: number | undefined;
  criteriaModule: Hex;
  offchainCouncilDetails: OffchainCouncilData | undefined;
  slug: string;
}) => ReactNode | undefined;

type Rule = {
  address: Hex;
  module: Module;
  liveParams?: ModuleParameter[] | undefined;
};

export const MODULE_MANAGERS: { [key: string]: ModuleManagerComponent } = {
  allowlist: AllowlistManager,
  agreement: AgreementManager,
};

const ModuleManager = ({
  rule,
  chainId,
  criteriaModule,
  offchainCouncilDetails,
  slug,
}: {
  rule: Rule;
  chainId: number | undefined;
  criteriaModule: Hex;
  offchainCouncilDetails: OffchainCouncilData | undefined;
  slug: string;
}) => {
  const knownModule = getKnownEligibilityModule(rule.module?.implementationAddress as Hex);

  if (!knownModule || !has(MODULE_MANAGERS, knownModule)) {
    return null;
  }

  const moduleDetailsFn = MODULE_MANAGERS[knownModule];
  if (!moduleDetailsFn || !rule || !chainId) return undefined;
  return moduleDetailsFn({
    m: {
      ...rule.module,
      liveParameters: rule.liveParams,
      instanceAddress: rule.address,
    } as ModuleDetails,
    chainId: chainId as SupportedChains,
    criteriaModule,
    offchainCouncilDetails,
    slug,
  });
};

export { ModuleManager };
