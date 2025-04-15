'use client';

import { useOverlay } from 'contexts';
import { find, pick } from 'lodash';
import { useErc20Details } from 'modules-hooks';
import { BsCheckSquareFill, BsFillXOctagonFill } from 'react-icons/bs';
import { ModuleDetails } from 'types';
import { Button } from 'ui';
import { ModuleDetailsHandler } from 'utils';
import { formatUnits, Hex } from 'viem';

import { ELIGIBILITY_STATUS, EligibilityRuleDetails } from '../eligibility-rules';
import Erc20Modal from './erc20-modal';

interface Erc20TokenDetails {
  symbol: string;
  decimals: number;
}

const IS_CLAIMS_APP = process.env.NEXT_PUBLIC_CLAIMS_APP === 'true';
const IS_PRO_APP = process.env.NEXT_PUBLIC_PRO_APP === 'true';

const Erc20Button = ({
  moduleDetails,
  tokenDetails,
  amountValueDisplay,
}: {
  moduleDetails: ModuleDetails | undefined;
  tokenDetails: Erc20TokenDetails | undefined;
  amountValueDisplay: string | undefined;
}) => {
  const { setModals } = useOverlay();

  // If not in claims or pro app, display the amount value display
  if (!IS_CLAIMS_APP && !IS_PRO_APP) {
    return (
      <span>
        {amountValueDisplay} ${tokenDetails?.symbol}
      </span>
    );
  }

  return (
    <Button
      onClick={() => setModals?.({ [`${moduleDetails?.instanceAddress}-erc20`]: true })}
      variant='link'
      className='text-base underline'
    >
      <p>
        {amountValueDisplay} ${tokenDetails?.symbol}
      </p>
    </Button>
  );
};

export const Erc20EligibilityRule = ({ moduleDetails, moduleParameters, wearer, chainId }: ModuleDetailsHandler) => {
  const tokenParam = find(moduleParameters, { displayType: 'erc20' });
  const amountParameter = find(moduleParameters, ['displayType', 'amountWithDecimals']);

  const { data: erc20Details } = useErc20Details({
    contractAddress: tokenParam?.value as Hex,
    wearerAddress: wearer,
    chainId,
  });
  const { userBalance, userBalanceDisplay, tokenDetails } = pick(erc20Details, [
    'userBalance',
    'userBalanceDisplay',
    'tokenDetails',
  ]);
  const amountValueDisplay = amountParameter?.value
    ? formatUnits(amountParameter?.value as bigint, tokenDetails?.decimals || 18)
    : undefined;

  // calculate eligibility
  if (userBalance && userBalance >= (amountParameter?.value as bigint)) {
    return (
      <>
        <Erc20Modal moduleDetails={moduleDetails} />

        <EligibilityRuleDetails
          rule={
            <div>
              Retain at least{' '}
              <Erc20Button
                moduleDetails={moduleDetails}
                tokenDetails={tokenDetails}
                amountValueDisplay={amountValueDisplay}
              />
            </div>
          }
          displayStatus={userBalanceDisplay}
          status={ELIGIBILITY_STATUS.eligible}
          icon={BsCheckSquareFill}
        />
      </>
    );
  }

  // fallback to ineligible
  return (
    <>
      <Erc20Modal moduleDetails={moduleDetails} />

      <EligibilityRuleDetails
        rule={
          <div>
            Hold at least{' '}
            <Erc20Button
              moduleDetails={moduleDetails}
              tokenDetails={tokenDetails}
              amountValueDisplay={amountValueDisplay}
            />
          </div>
        }
        displayStatus={userBalanceDisplay}
        status={ELIGIBILITY_STATUS.ineligible}
        icon={BsFillXOctagonFill}
      />
    </>
  );
};
