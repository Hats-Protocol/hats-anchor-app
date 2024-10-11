'use client';

import { As, IconProps, MergeWithAs } from '@chakra-ui/react';
import { ComponentType, ReactNode, SVGProps } from 'react';
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

type RuleIcon =
  | ComponentType<MergeWithAs<SVGProps<SVGSVGElement>, object, IconProps, As>>
  | IconType
  | undefined;

export interface EligibilityRuleDetailsProps {
  rule: ReactNode | undefined;
  status: string | undefined;
  displayStatus: string | undefined;
  displayStatusLink?: string | undefined;
  icon: RuleIcon;
  isReadyToClaim?: boolean;
}

export type ToggleRuleDetails = {
  rule: JSX.Element;
  displayStatus: string;
  status: ValueOf<typeof TOGGLE_STATUS>;
  icon: ComponentType<object>;
};
