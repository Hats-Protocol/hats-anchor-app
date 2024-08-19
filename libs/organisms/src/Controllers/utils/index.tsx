'use client';

import { ComponentType } from 'react';
import { ValueOf } from 'types';

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

const eligibilityModule = (name: string) => `${name} Eligibility`;
export const ELIGIBILITY_MODULES = {
  agreement: eligibilityModule('Agreement'),
  allowlist: eligibilityModule('Allowlist'),
  election: eligibilityModule('Hats Election'),
  erc20: eligibilityModule('ERC20'),
  erc721: eligibilityModule('ERC721'),
  erc1155: eligibilityModule('ERC1155'),
  hatWearing: eligibilityModule('Hat Wearing'),
  jokerace: eligibilityModule('JokeRace'),
  passthrough: 'Passthrough Module',
  staking: eligibilityModule('Staking'),
  // meta modules
  eligibilityChain: 'Eligibilities Chain',
};

export const TOGGLE_MODULES = {
  passthrough: 'Passthrough Module',
  season: 'Season Toggle',
};
