'use client';

import { Button, Text } from '@chakra-ui/react';
import { useOverlay } from 'contexts';
import { find, pick } from 'lodash';
import { useStakingDetails } from 'modules-hooks';
import posthog from 'posthog-js';
import { BsCheckSquareFill, BsFillXOctagonFill } from 'react-icons/bs';
import { ModuleDetailsHandler } from 'utils';
import { formatUnits } from 'viem';

import {
  ELIGIBILITY_STATUS,
  EligibilityRuleDetails,
} from '../eligibility-rules';
import { StakingModal } from './staking-modal';

export const StakingEligibilityRule = ({
  moduleDetails,
  moduleParameters,
  selectedHat,
  chainId,
  wearer,
}: ModuleDetailsHandler) => {
  const { setModals } = useOverlay();

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

  const eligibilityModalFlag =
    posthog.isFeatureEnabled('eligibility-modal') ||
    process.env.NODE_ENV === 'development';

  if (!moduleDetails) return null;

  return (
    <>
      <StakingModal
        eligibilityHatId={selectedHat?.id}
        moduleInfo={{
          ...moduleDetails,
          liveParameters: moduleParameters,
        }}
      />

      <EligibilityRuleDetails
        rule={
          eligibilityModalFlag ? (
            <Button
              variant='link'
              onClick={() => setModals?.({ stakingManager: true })}
            >
              Stake {amountParamDisplay} {tokenDetails?.symbol}
            </Button>
          ) : (
            <Text>
              Stake {amountParamDisplay} {tokenDetails?.symbol}
            </Text>
          )
        }
        status={
          isEligible
            ? ELIGIBILITY_STATUS.eligible
            : ELIGIBILITY_STATUS.ineligible
        }
        displayStatus={`${stakeBalanceDisplay} ${tokenDetails?.symbol}`}
        icon={isEligible ? BsCheckSquareFill : BsFillXOctagonFill}
      />
    </>
  );
};
