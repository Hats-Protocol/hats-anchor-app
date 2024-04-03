import { Text } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { ComponentType } from 'react';
import { ValueOf } from 'types';

const RemovedWearer = dynamic(() =>
  import('icons').then((i) => i.RemovedWearer),
);

export const ELIGIBILITY_STATUS = {
  eligible: 'eligible',
  ineligible: 'ineligible',
  hat: 'hat',
};

export const TOGGLE_STATUS = {
  active: 'active',
  inactive: 'inactive',
  hat: 'hat',
};

export const TOKEN_PARAM_DISPLAY_TYPES = {
  erc20: 'erc20',
  erc721: 'erc721',
  erc1155: 'erc1155',
};

export type EligibilityRuleDetails = {
  rule: JSX.Element;
  displayStatus: string;
  status: ValueOf<typeof ELIGIBILITY_STATUS>;
  icon: ComponentType<object>;
};

export type ToggleRuleDetails = {
  rule: JSX.Element;
  displayStatus: string;
  status: ValueOf<typeof TOGGLE_STATUS>;
  icon: ComponentType<object>;
};

// should we be using better defaults than these?
export const DEFAULT_ELIGIBILITY_DETAILS: EligibilityRuleDetails = {
  rule: <Text>Comply with 1 rule to keep this Hat</Text>,
  status: ELIGIBILITY_STATUS.ineligible,
  displayStatus: 'Ineligible',
  icon: RemovedWearer,
};

export const DEFAULT_TOGGLE_RULE_DETAILS: ToggleRuleDetails = {
  rule: <Text>One address can deactivate this Hat</Text>,
  status: TOGGLE_STATUS.inactive,
  displayStatus: 'Inactive',
  icon: RemovedWearer,
};
