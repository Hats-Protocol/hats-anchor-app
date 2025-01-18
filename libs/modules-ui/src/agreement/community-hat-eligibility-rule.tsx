'use client';

import { Button, Text } from '@chakra-ui/react';
import { useOverlay } from 'contexts';
import { useWearersEligibilityStatus } from 'hats-hooks';
import { useMediaStyles } from 'hooks';
import { get, includes, toLower } from 'lodash';
import { BsCheckSquare, BsCheckSquareFill, BsXOctagonFill } from 'react-icons/bs';
import { SupportedChains } from 'types';
import { Link } from 'ui';
import { claimsLink, ModuleDetailsHandler } from 'utils';
import { Hex } from 'viem';

import { ELIGIBILITY_STATUS, EligibilityRuleDetails } from '../eligibility-rules';

const IS_CLAIMS_APP = process.env.NEXT_PUBLIC_CLAIMS_APP === 'true';
const MODAL_NAME = 'agreementManager';

export const CommunityHatEligibilityRule = ({
  selectedHat,
  wearer,
  chainId,
  moduleDetails,
  setIsReadyToClaim,
  isReadyToClaim,
  modalSuffix,
}: ModuleDetailsHandler) => {
  const { isMobile } = useMediaStyles();
  const { setModals } = useOverlay();

  const wearerIds = wearer ? [toLower(wearer) as Hex] : [];
  const { data: wearerStatus } = useWearersEligibilityStatus({
    selectedHat,
    wearerIds,
    chainId: chainId as SupportedChains,
  });
  const isEligible = includes(get(wearerStatus, 'eligibleWearers'), toLower(wearer));

  let status = ELIGIBILITY_STATUS.ineligible;
  let displayStatus = 'Not Signed';
  let icon = BsXOctagonFill;

  if (isEligible) {
    status = ELIGIBILITY_STATUS.eligible;
    displayStatus = 'Signed';
    icon = BsCheckSquareFill;
  } else if (isReadyToClaim) {
    // viewed/reviewed the agreement
    status = ELIGIBILITY_STATUS.pending;
    displayStatus = 'Pending';
    icon = BsCheckSquare;
  }

  let modalName = `${selectedHat?.eligibility}-${MODAL_NAME}`;
  if (modalSuffix) modalName += modalSuffix;

  if (!IS_CLAIMS_APP) {
    return (
      <EligibilityRuleDetails
        rule={
          <Text>
            Sign the <Link href={claimsLink({ chainId, hatId: selectedHat?.id })}>Agreement</Link>
          </Text>
        }
        status={status}
        displayStatus={displayStatus}
        icon={icon}
        isReadyToClaim={isReadyToClaim}
      />
    );
  }

  if (isMobile) {
    return (
      <EligibilityRuleDetails
        rule={
          <Text>
            Sign the{' '}
            <Button
              onClick={() => {
                if (!moduleDetails?.instanceAddress) return;
                setIsReadyToClaim?.(moduleDetails.instanceAddress);
                setModals?.({ [modalName]: true });
              }}
              variant='link'
            >
              Agreement
            </Button>
          </Text>
        }
        status={status}
        displayStatus={displayStatus}
        icon={icon}
        isReadyToClaim={isReadyToClaim}
      />
    );
  }

  // desktop handled in card section
  return (
    <EligibilityRuleDetails
      rule={<Text>Sign the Agreement</Text>}
      status={status}
      displayStatus={displayStatus}
      icon={icon}
      isReadyToClaim={isReadyToClaim}
    />
  );
};
