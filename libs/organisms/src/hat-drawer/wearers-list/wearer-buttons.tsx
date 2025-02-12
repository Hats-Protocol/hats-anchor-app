'use client';

import { useOverlay, useSelectedHat, useTreeForm } from 'contexts';
import { useWearerDetails, useWearersEligibilityStatus } from 'hats-hooks';
import { isWearingAdminHat } from 'hats-utils';
import { useMediaStyles } from 'hooks';
import { find, get, gt, gte, includes, map, pick, size, toNumber } from 'lodash';
import { useHatClaimBy, useMultiClaimsHatterCheck } from 'modules-hooks';
import { useMemo } from 'react';
import { FaPlus } from 'react-icons/fa';
import { Button, Tooltip } from 'ui';
import { Hex } from 'viem';
import { useAccount, useChainId } from 'wagmi';

const claimTooltip = ({
  claimFor,
  sameChain,
  hatterIsAdmin,
}: {
  claimFor: boolean;
  sameChain: boolean;
  hatterIsAdmin: boolean;
}) => {
  if (!sameChain)
    return claimFor
      ? "You can't claim this hat for a wearer from a different chain"
      : "You can't claim a hat from a different chain.";
  if (!hatterIsAdmin)
    return claimFor
      ? 'Hatter must be wearing an admin hat to claim this hat for a wearer.'
      : 'Hatter must be wearing an admin hat to claim this hat.';
  return undefined;
};

const addWearerTooltip = (sameChain: boolean, maxWearersReached: boolean) => {
  if (!sameChain) return "You can't add a wearer from a different chain.";
  if (maxWearersReached) return 'Maximum number of wearers reached.';

  return undefined;
};

const WearerButtons = () => {
  const { setModals, handlePendingTx } = useOverlay();
  const { isMobile } = useMediaStyles();
  const { chainId, onchainHats, storedData } = useTreeForm();
  const { selectedHat } = useSelectedHat();
  const { address } = useAccount();
  const currentNetworkId = useChainId();

  const { data: wearersEligibility } = useWearersEligibilityStatus({
    selectedHat,
    chainId,
  });
  const { eligibleWearers: eligibleWearerIds } = useMemo(
    () => pick(wearersEligibility, ['eligibleWearers']),
    [wearersEligibility],
  );

  const { data: wearer } = useWearerDetails({
    wearerAddress: address as Hex,
    chainId,
    editMode: false, // change if used in edit mode
  });
  const currentUserIsWearing = useMemo(() => find(wearer, { id: selectedHat?.id }), [selectedHat?.id, wearer]);

  const wearerIds = address ? ([address] as Hex[]) : [];
  const { data: currentUserEligibility } = useWearersEligibilityStatus({
    wearerIds,
    selectedHat,
    chainId,
  });
  const currentUserIsEligible = includes(get(currentUserEligibility, 'eligibleWearers'), address);

  const { claimHat, hatterIsAdmin, isClaimable } = useHatClaimBy({
    selectedHat,
    chainId,
    wearer: address as Hex,
    handlePendingTx,
  });

  const { currentHatIsClaimable } = useMultiClaimsHatterCheck({
    selectedHat,
    chainId,
    onchainHats,
    editMode: false, // change if used in edit mode
    storedData,
  });

  const isAdminUser = isWearingAdminHat(map(wearer, 'id'), selectedHat?.id);

  const maxWearersReached = gte(size(eligibleWearerIds), toNumber(selectedHat?.maxSupply));

  // order of button priority
  // 0. show all wearers
  // 1. claim hat for wearer
  // 2. add wearer (for admins)
  // 3. claim hat

  const hatIsClaimable =
    (currentUserIsEligible as boolean) &&
    !!isClaimable &&
    !currentHatIsClaimable?.for &&
    !isAdminUser &&
    !currentUserIsWearing;

  if (!gt(size(eligibleWearerIds), 4) && !isAdminUser && !hatIsClaimable) {
    return null;
  }

  return (
    <div className='flex items-center justify-between px-4 pt-2 md:px-0'>
      {gt(size(eligibleWearerIds), 4) && (
        <Button
          onClick={() => setModals?.({ hatWearers: true })}
          className='text-functional-link-secondary hover:text-functional-link-secondary/80 text-base'
          variant='link'
          // TODO technically not taking into account eligibility here
        >
          Show all {get(selectedHat, 'currentSupply')} wearers
        </Button>
      )}

      {!isMobile && (
        <>
          {!isAdminUser && currentHatIsClaimable?.for && address && (
            <Tooltip
              label={claimTooltip({
                claimFor: true,
                sameChain: chainId === currentNetworkId,
                hatterIsAdmin: hatterIsAdmin as boolean,
              })}
            >
              <Button
                variant='link'
                disabled={maxWearersReached || !hatterIsAdmin || chainId !== currentNetworkId}
                // isLoading={isLoading}
                onClick={() => (!maxWearersReached ? setModals?.({ claimFor: true }) : {})}
                className='text-functional-link-primary hover:text-functional-link-primary/80 flex items-center gap-2 text-base'
              >
                <FaPlus />
                <p className='text-base'>Claim hat for wearer</p>
              </Button>
            </Tooltip>
          )}
          {hatIsClaimable && (
            <Tooltip
              label={claimTooltip({
                claimFor: false,
                sameChain: chainId === currentNetworkId,
                hatterIsAdmin: hatterIsAdmin as boolean,
              })}
            >
              <Button
                variant='link'
                disabled={!claimHat || maxWearersReached || !hatterIsAdmin || chainId !== currentNetworkId}
                onClick={claimHat}
              >
                <div className='text-functional-link-primary hover:text-functional-link-primary/80 flex items-center gap-2 text-base'>
                  <FaPlus />
                  <p>Claim Hat</p>
                </div>
              </Button>
            </Tooltip>
          )}
          {isAdminUser && (
            <Tooltip label={addWearerTooltip(chainId === currentNetworkId, maxWearersReached)}>
              <Button
                variant='link'
                disabled={maxWearersReached || chainId !== currentNetworkId}
                onClick={() => (!maxWearersReached ? setModals?.({ newWearer: true }) : {})}
              >
                <div className='text-functional-link-primary hover:text-functional-link-primary/80 flex cursor-pointer items-center gap-2 text-base'>
                  <FaPlus />
                  <p>Add a wearer</p>
                </div>
              </Button>
            </Tooltip>
          )}
        </>
      )}
    </div>
  );
};

export { WearerButtons };
