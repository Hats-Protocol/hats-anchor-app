'use client';

import { CONTROLLER_TYPES } from '@hatsprotocol/constants';
import { hatIdDecimalToHex, hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { eq, find, get } from 'lodash';
import dynamic from 'next/dynamic';
import { IconType } from 'react-icons';
import { hatLink, ModuleDetailsHandler } from 'utils';

import { ELIGIBILITY_STATUS, EligibilityRuleDetails, TOGGLE_STATUS } from '../eligibility-rules';

const HatIcon = dynamic(() => import('icons').then((i) => i.HatIcon));

export const PassthroughEligibility = ({ moduleParameters, chainId }: ModuleDetailsHandler) => {
  const passthroughHat = find(moduleParameters, { displayType: 'hat' });
  // TODO fetch hat name from details
  const passthroughHatDisplay = hatIdDecimalToIp(get(passthroughHat, 'value') as bigint);
  const passthroughHatId = hatIdDecimalToHex(get(passthroughHat, 'value') as bigint);

  return (
    <EligibilityRuleDetails
      rule={<p>One Hat can choose eligible wearers</p>}
      status={ELIGIBILITY_STATUS.hat}
      displayStatus={passthroughHatDisplay}
      displayStatusLink={hatLink({ chainId, hatId: passthroughHatId })}
      icon={HatIcon as IconType}
    />
  );
};

export const PassthroughToggle = ({ moduleParameters, chainId }: ModuleDetailsHandler) => {
  const passthroughHat = find(moduleParameters, { displayType: 'hat' });
  const passthroughHatDisplay = hatIdDecimalToIp(get(passthroughHat, 'value') as bigint);
  const passthroughHatId = hatIdDecimalToHex(get(passthroughHat, 'value') as bigint);

  return (
    <EligibilityRuleDetails
      rule={<p>One Hat can deactivate this Hat</p>}
      status={TOGGLE_STATUS.hat}
      displayStatus={passthroughHatDisplay}
      displayStatusLink={hatLink({ chainId, hatId: passthroughHatId })}
      icon={HatIcon as IconType}
    />
  );
};

export const PassthroughModuleRule = ({ moduleParameters, chainId, wearer, moduleType }: ModuleDetailsHandler) => {
  if (eq(moduleType, CONTROLLER_TYPES.eligibility)) {
    return PassthroughEligibility({
      moduleParameters,
      chainId,
      wearer,
    });
  }

  return PassthroughToggle({
    moduleParameters,
    chainId,
    wearer,
  });
};
