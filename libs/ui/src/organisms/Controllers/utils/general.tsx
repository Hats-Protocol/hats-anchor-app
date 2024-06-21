'use client';

import { Text } from '@chakra-ui/react';
import { HATS_ABI } from '@hatsprotocol/constants';
// import { HATS } from '@hatsprotocol/hats-account-sdk/dist/constants';
import dynamic from 'next/dynamic';
import { ComponentType } from 'react';
import { ValueOf } from 'types';
import { viemPublicClient } from 'utils';
import { Hex } from 'viem';

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

export const DEFAULT_ELIGIBILITY_DETAILS = async ({
  wearer,
  chainId,
}: {
  wearer?: Hex;
  chainId?: number;
}) => {
  if (!wearer || !chainId) {
    return Promise.resolve({
      rule: (
        <Text size={{ base: 'sm', md: 'md' }}>
          Comply with 1 rule to keep this Hat
        </Text>
      ),
      status: ELIGIBILITY_STATUS.ineligible,
      displayStatus: 'Ineligible',
      icon: RemovedWearer,
    });
  }

  const isEligible = await viemPublicClient(chainId).readContract({
    address: '0x3bc1A0Ad72417f2d411118085256fC53CBdDd137', // HATS,
    abi: HATS_ABI,
    functionName: 'isEligible',
    args: [wearer],
  });

  return Promise.resolve({
    rule: (
      <Text size={{ base: 'sm', md: 'md' }}>
        Comply with 1 rule to keep this Hat
      </Text>
    ),
    status: isEligible
      ? ELIGIBILITY_STATUS.eligible
      : ELIGIBILITY_STATUS.ineligible,
    displayStatus: isEligible ? 'Eligible' : 'Ineligible',
    icon: RemovedWearer,
  });
};

// TODO add dynamic check to fallback
export const DEFAULT_TOGGLE_RULE_DETAILS: ToggleRuleDetails = {
  rule: (
    <Text size={{ base: 'sm', md: 'md' }}>
      One address can deactivate this Hat
    </Text>
  ),
  status: TOGGLE_STATUS.inactive,
  displayStatus: 'Inactive',
  icon: RemovedWearer,
};
