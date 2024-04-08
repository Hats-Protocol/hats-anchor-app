/* eslint-disable import/prefer-default-export */
import { Text } from '@chakra-ui/react';
import { MODULE_TYPES } from '@hatsprotocol/constants';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { ModuleDetailsHandler } from 'utils';

import {
  ELIGIBILITY_STATUS,
  EligibilityRuleDetails,
  TOGGLE_STATUS,
  ToggleRuleDetails,
} from '../general';

const HatIcon = dynamic(() => import('icons').then((i) => i.HatIcon));

const handlePassthroughEligibility = async ({
  moduleParameters,
}: ModuleDetailsHandler): Promise<EligibilityRuleDetails> => {
  const passthroughHat = _.find(moduleParameters, { displayType: 'hat' });
  // TODO fetch hat name from details
  const passthroughHatDisplay = hatIdDecimalToIp(
    _.get(passthroughHat, 'value') as bigint,
  );

  return Promise.resolve({
    rule: (
      <Text size={{ base: 'sm', md: 'md' }}>One Hat can remove wearers</Text>
    ),
    status: ELIGIBILITY_STATUS.hat,
    displayStatus: passthroughHatDisplay,
    icon: HatIcon,
  });
};

const handlePassthroughToggle = async ({
  moduleParameters,
}: ModuleDetailsHandler): Promise<ToggleRuleDetails> => {
  const passthroughHat = _.find(moduleParameters, { displayType: 'hat' });
  const passthroughHatDisplay = hatIdDecimalToIp(
    _.get(passthroughHat, 'value') as bigint,
  );

  return Promise.resolve({
    rule: (
      <Text size={{ base: 'sm', md: 'md' }}>
        One Hat can deactivate this Hat
      </Text>
    ),
    status: TOGGLE_STATUS.hat,
    displayStatus: passthroughHatDisplay,
    icon: HatIcon,
  });
};

export const handlePassthroughModule = ({
  moduleParameters,
  chainId,
  wearer,
  moduleType,
}: ModuleDetailsHandler): Promise<ToggleRuleDetails> => {
  if (_.eq(moduleType, MODULE_TYPES.eligibility)) {
    return handlePassthroughEligibility({
      moduleParameters,
      chainId,
      wearer,
    });
  }

  return handlePassthroughToggle({
    moduleParameters,
    chainId,
    wearer,
  });
};
