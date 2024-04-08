/* eslint-disable import/prefer-default-export */
import { Text } from '@chakra-ui/react';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { BsCheckSquareFill } from 'react-icons/bs';
import { ModuleDetailsHandler } from 'utils';
import { formatUnits, Hex } from 'viem';
import { fetchToken, FetchTokenResult, readContract } from 'wagmi/actions';

import {
  DEFAULT_ELIGIBILITY_DETAILS,
  ELIGIBILITY_STATUS,
  EligibilityRuleDetails,
} from '../general';

const RemovedWearer = dynamic(() =>
  import('icons').then((i) => i.RemovedWearer),
);

type Stake = {
  amount: bigint;
  slashed: boolean;
};

export const handleStakingEligibility = async ({
  moduleDetails,
  moduleParameters,
  chainId,
  wearer,
}: ModuleDetailsHandler): Promise<EligibilityRuleDetails> => {
  const tokenParam = _.find(moduleParameters, { label: 'Staking Token' });
  const amountParam = _.find(moduleParameters, { label: 'Minimum Stake' });
  const abi = _.get(moduleDetails, 'abi');
  if (!tokenParam || !amountParam || !abi)
    return Promise.resolve(DEFAULT_ELIGIBILITY_DETAILS);

  const promises: Promise<unknown>[] = [
    // fetch staking token details
    fetchToken({ address: tokenParam?.value as Hex, chainId }),
  ];
  if (wearer) {
    // check stakes if wearer is provided
    promises.push(
      readContract({
        address: tokenParam?.value as Hex,
        abi,
        chainId,
        functionName: 'stakes',
        args: [wearer],
      })
        .then((stake: unknown) => {
          return Promise.resolve(stake as Stake);
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error('Error fetching stakes', error);
          return Promise.resolve(undefined);
        }),
    );
  }
  const result = await Promise.all(promises);
  const [tokenDetails, stakeBalance] = result as [FetchTokenResult, Stake];

  const amountParamDisplay =
    formatUnits(amountParam?.value as bigint, tokenDetails?.decimals) || '0';
  const stakeBalanceDisplay = stakeBalance?.amount
    ? formatUnits(stakeBalance?.amount, tokenDetails?.decimals)
    : '0';
  const isEligible = stakeBalance?.amount >= (amountParam?.value as bigint);

  return Promise.resolve({
    rule: (
      <Text size={{ base: 'sm', md: 'md' }}>
        Stake {amountParamDisplay} ${tokenDetails?.symbol}
      </Text>
    ),
    status: isEligible
      ? ELIGIBILITY_STATUS.eligible
      : ELIGIBILITY_STATUS.ineligible,
    displayStatus: stakeBalanceDisplay,
    icon: isEligible ? BsCheckSquareFill : RemovedWearer,
  });
};
