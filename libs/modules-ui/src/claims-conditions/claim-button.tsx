'use client';

import { CONFIG } from '@hatsprotocol/config';
import { hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { useEligibility, useOverlay } from 'contexts';
import { useWearerDetails } from 'hats-hooks';
import { HatIcon } from 'icons';
import { capitalize, filter, first, flatten, get, includes, map, size } from 'lodash';
import { useClaimFn } from 'modules-hooks';
import { ConnectWallet, NetworkSwitcher } from 'molecules';
import { BsArrowRight } from 'react-icons/bs';
import { idToIp } from 'shared';
import { AppHat } from 'types';
import { Button, LinkButton, Tooltip } from 'ui';
import { eligibilityRuleToModuleDetails } from 'utils';
import { Hex } from 'viem';
import { useAccount, useChainId } from 'wagmi';

export const ClaimButton = () => {
  const { address } = useAccount();
  const currentChainId = useChainId();
  const { handlePendingTx } = useOverlay();
  const { chainId, selectedHat, eligibilityRules, isClaimableFor, hatterIsAdmin, isReadyToClaim, currentEligibility } =
    useEligibility();

  const { data: wearer } = useWearerDetails({
    wearerAddress: address as Hex,
    chainId,
  });
  const isWearing = includes(map(wearer, 'id'), selectedHat?.id);

  const multipleRules = size(flatten(eligibilityRules)) > 1; // TODO hardcode flatten eligibilityRules (only handles single AND chains)
  const rulesNotAlreadyClaimed = filter(flatten(eligibilityRules), (rule) => {
    return (
      !get(currentEligibility, `${rule.address}.eligible`) || !get(currentEligibility, `${rule.address}.goodStanding`)
    );
  });

  const multipleModulesRemaining = size(rulesNotAlreadyClaimed) > 1;

  const moduleDetails = eligibilityRuleToModuleDetails(
    multipleRules ? first(rulesNotAlreadyClaimed) : first(flatten(eligibilityRules)), // TODO assuming there is only 1 rule remaining to claim
  );

  const { handleClaim, disableClaim, disableReason, requireHatter, isLoading, isEligible } = useClaimFn({
    selectedHat: selectedHat as AppHat,
    handlePendingTx,
    moduleParameters: get(moduleDetails, 'liveParameters'),
    moduleDetails,
    chainId,
    isReadyToClaim,
    onSuccess: () => {
      console.log('onSuccess');
    },
    onError: () => {
      console.log('onError');
    },
    onDecline: () => {
      console.log('onDecline');
    },
  });

  const hatUrl = selectedHat?.id
    ? `${CONFIG.APP_URL}/trees/${chainId}/${hatIdToTreeId(BigInt(selectedHat.id))}?hatId=${idToIp(selectedHat.id)}`
    : '#';

  if (isWearing && isEligible) {
    return (
      <div className='flex'>
        <LinkButton
          href={hatUrl}
          leftIcon={<HatIcon className='h-4 w-4' />}
          rightIcon={<BsArrowRight className='h-4 w-4' />}
          className='bg-functional-success flex items-center gap-1'
          isExternal
        >
          View your hat
        </LinkButton>
      </div>
    );
  }

  let hatterIfNeeded = false;
  // check hatter if needed
  if (requireHatter) {
    // hatter must be an admin wearer
    // can't claim if not claimable for - module claims on behalf of user
    hatterIfNeeded = !hatterIsAdmin || !isClaimableFor || false;
  }

  let tooltip = '';
  if (requireHatter && !hatterIsAdmin) {
    tooltip = 'There is no claims hatter enabled for this tree';
  }
  if (requireHatter && !isClaimableFor) {
    tooltip = 'Ensure any address can claim on behalf of wearers';
  }
  if (multipleModulesRemaining) {
    tooltip = 'There are multiple rules remaining to claim';
  }
  if (isWearing && isEligible) {
    tooltip = 'You are already wearing this hat';
  }
  // TODO check supply of hat

  if (!address) {
    return <ConnectWallet />;
  }

  if (currentChainId !== chainId) {
    return <NetworkSwitcher chainId={chainId} />;
  }
  // console.log({ hatterIfNeeded, disableClaim, disableReason, isWearing, isEligible, currentChainId, chainId });

  return (
    <Tooltip label={tooltip || disableReason}>
      <Button
        // won't hit this flow if wrong network
        disabled={hatterIfNeeded || disableClaim || (isWearing && isEligible) || currentChainId !== chainId} // handle isReadyToClaim on respective disableClaims
        onClick={handleClaim}
        // isLoading={isLoading}
      >
        <div className='flex items-center gap-2'>
          <HatIcon className='h-4 w-4' />
          <span>Claim this {capitalize(CONFIG.TERMS.hat)}</span>
        </div>
      </Button>
    </Tooltip>
  );
};
