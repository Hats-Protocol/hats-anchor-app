'use client';

/* eslint-disable import/prefer-default-export */
import { Text } from '@chakra-ui/react';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { BsCheckSquareFill } from 'react-icons/bs';
import { ModuleDetailsHandler, viemPublicClient } from 'utils';
import { erc20Abi, formatUnits, Hex } from 'viem';

import {
  DEFAULT_ELIGIBILITY_DETAILS,
  ELIGIBILITY_STATUS,
  EligibilityRuleDetails,
} from '../general';

const RemovedWearer = dynamic(() =>
  import('icons').then((i) => i.RemovedWearer),
);

export const handleChainModule = async ({
  ruleSets,
  chainId,
  wearer,
}: ModuleDetailsHandler): Promise<EligibilityRuleDetails> => {
  return Promise.resolve({
    rule: (
      <Text size={{ base: 'sm', md: 'md' }}>
        Chain
        {/* Stake {amountParamDisplay} ${tokenDetails?.symbol} */}
      </Text>
    ),
    status: ELIGIBILITY_STATUS.ineligible,
    displayStatus: '0', // stakeBalanceDisplay,
    icon: RemovedWearer,
  });
};
