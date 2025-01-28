import { ComponentType, ReactNode } from 'react';
import { IconType } from 'react-icons';
import { ValueOf } from 'types';

export const ELIGIBILITY_STATUS = {
  eligible: 'eligible',
  ineligible: 'ineligible',
  pending: 'pending',
  expiring: 'expiring',
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

export interface EligibilityRuleDetailsProps {
  rule: ReactNode | undefined;
  status: string | undefined;
  displayStatus: string | undefined;
  displayStatusLink?: string | undefined;
  icon: IconType | undefined;
  isReadyToClaim?: { [key: string]: boolean } | undefined;
}

export type ToggleRuleDetails = {
  rule: JSX.Element;
  displayStatus: string;
  status: ValueOf<typeof TOGGLE_STATUS>;
  icon: ComponentType<object>;
};
