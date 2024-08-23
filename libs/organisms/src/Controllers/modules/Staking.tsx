'use client';

import { Text } from '@chakra-ui/react';
import { find, pick } from 'lodash';
import { useStakingDetails } from 'modules-hooks';
import { BsCheckSquareFill, BsFillOctagonFill } from 'react-icons/bs';
import { ModuleDetailsHandler } from 'utils';
import { formatUnits } from 'viem';

import { ELIGIBILITY_STATUS } from '../utils';
import EligibilityRule from './EligibilityRule';

const StakingEligibility = ({
  moduleDetails,
  moduleParameters,
  chainId,
  wearer,
}: ModuleDetailsHandler) => {
  const amountParam = find(moduleParameters, { label: 'Minimum Stake' });

  const { data: stakingDetails } = useStakingDetails({
    moduleDetails,
    moduleParameters,
    chainId,
    wearer,
  });

  const { stakeBalance, stakeBalanceDisplay, tokenDetails } = pick(
    stakingDetails,
    ['stakeBalance', 'stakeBalanceDisplay', 'tokenDetails'],
  );

  const amountParamDisplay =
    ((amountParam?.value &&
      formatUnits(
        amountParam.value as bigint,
        tokenDetails?.decimals || 18,
      )) as string) || '0';

  const isEligible =
    stakeBalance && stakeBalance >= (amountParam?.value as bigint);

  return (
    <EligibilityRule
      rule={
        <Text size={{ base: 'sm', md: 'md' }}>
          Stake {amountParamDisplay} {tokenDetails?.symbol}
        </Text>
      }
      status={
        isEligible ? ELIGIBILITY_STATUS.eligible : ELIGIBILITY_STATUS.ineligible
      }
      displayStatus={`${stakeBalanceDisplay} ${tokenDetails?.symbol}`}
      icon={isEligible ? BsCheckSquareFill : BsFillOctagonFill}
    />
  );
};

export default StakingEligibility;
