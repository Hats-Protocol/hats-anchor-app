'use client';

import { Button, Text } from '@chakra-ui/react';
import { useOverlay } from 'contexts';
import { useWearersEligibilityStatus } from 'hats-hooks';
import { useMediaStyles } from 'hooks';
import { get, includes, toLower } from 'lodash';
import { useLockFromHat } from 'modules-hooks';
import dynamic from 'next/dynamic';
import {
  BsCheckSquare,
  BsCheckSquareFill,
  BsFillXOctagonFill,
} from 'react-icons/bs';
import { SupportedChains } from 'types';
import { claimsLink, ModuleDetailsHandler } from 'utils';
import { Hex } from 'viem';

import {
  ELIGIBILITY_STATUS,
  EligibilityRuleDetails,
} from '../eligibility-rules';

const ChakraNextLink = dynamic(() =>
  import('ui').then((mod) => mod.ChakraNextLink),
);

const IS_CLAIMS_APP = process.env.NEXT_PUBLIC_CLAIMS_APP === 'true';
const SUBSCRIPTION_MODAL_NAME = 'subscriptionManager';

export const UnlockEligibilityRule = ({
  selectedHat,
  moduleParameters,
  chainId,
  wearer,
  modalSuffix,
  isReadyToClaim,
}: ModuleDetailsHandler) => {
  const { setModals } = useOverlay();
  const { isMobile } = useMediaStyles();

  const { allowance: tokenAllowance, keyPrice } = useLockFromHat({
    moduleParameters,
    chainId,
  });
  const hasAllowance =
    !!tokenAllowance && !!keyPrice && tokenAllowance >= keyPrice;

  const wearerIds = wearer ? [toLower(wearer) as Hex] : [];
  const { data: wearerStatus } = useWearersEligibilityStatus({
    selectedHat,
    wearerIds,
    chainId: chainId as SupportedChains,
  });
  const isEligible = includes(
    get(wearerStatus, 'eligibleWearers'),
    toLower(wearer),
  );
  const renewSoon = isEligible && !hasAllowance;

  let modalName = SUBSCRIPTION_MODAL_NAME;
  if (modalSuffix) {
    modalName = `${SUBSCRIPTION_MODAL_NAME}${modalSuffix}`;
  }

  let claimsAppRule = <Text>Pay the subscription</Text>;
  let status = ELIGIBILITY_STATUS.ineligible;
  let displayStatus = 'Not Paid';
  let icon = BsFillXOctagonFill;
  if (isMobile) {
    claimsAppRule = (
      <Text>
        Pay the{' '}
        <Button
          variant='link'
          onClick={() => {
            setModals?.({ [modalName]: true });
          }}
        >
          subscription
        </Button>
      </Text>
    );
  }
  if (isReadyToClaim || hasAllowance) {
    status = ELIGIBILITY_STATUS.pending;
    displayStatus = 'Pending';
    icon = BsCheckSquare;
  }
  if (isEligible) {
    if (renewSoon) {
      status = ELIGIBILITY_STATUS.eligible;
      displayStatus = 'Renew Soon';
      icon = BsCheckSquareFill;
    } else {
      status = ELIGIBILITY_STATUS.eligible;
      displayStatus = 'Paid';
      icon = BsCheckSquareFill;
    }
  }

  if (IS_CLAIMS_APP) {
    return (
      <EligibilityRuleDetails
        rule={claimsAppRule}
        status={status}
        displayStatus={displayStatus}
        icon={icon}
      />
    );
  }

  return (
    <EligibilityRuleDetails
      rule={
        <Text>
          Pay the{' '}
          <ChakraNextLink
            href={claimsLink({ chainId, hatId: selectedHat?.id })}
            decoration
          >
            subscription
          </ChakraNextLink>
        </Text>
      }
      status={status}
      displayStatus={displayStatus}
      icon={icon}
    />
  );
};
