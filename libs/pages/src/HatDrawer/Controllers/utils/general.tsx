import { Text } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

const RemovedWearer = dynamic(() =>
  import('icons').then((i) => i.RemovedWearer),
);

export const ELIGIBILITY_STATUS = {
  eligible: 'eligible',
  ineligible: 'ineligible',
};

export const TOKEN_PARAM_DISPLAY_TYPES = {
  erc20: 'erc20',
  erc721: 'erc721',
  erc1155: 'erc1155',
};

export type EligibilityRuleDetails = {
  rule: JSX.Element;
  displayStatus: string;
  status: string;
  icon: ComponentType<object>;
};

export const DEFAULT_ELIGIBILITY_DETAILS: EligibilityRuleDetails = {
  rule: <Text>Comply with 1 rule to keep this Hat</Text>,
  status: 'ineligible',
  displayStatus: 'Ineligible',
  icon: RemovedWearer,
};
