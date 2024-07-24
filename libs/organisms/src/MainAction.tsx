'use client';

import { Button, Tooltip } from '@chakra-ui/react';
import { useOverlay, useSelectedHat, useTreeForm } from 'contexts';
import { useWearerDetails, useWearersEligibilityStatus } from 'hats-hooks';
import { isWearingAdminHat } from 'hats-utils';
import _ from 'lodash';
import { useHatClaimBy } from 'modules-hooks';
import { ConnectWallet, NetworkSwitcher } from 'molecules';
import { useMemo } from 'react';
import { useAccount, useChainId } from 'wagmi';

const MainAction = () => {
  const currentNetworkId = useChainId();
  const { address } = useAccount();
  const currentChainId = useChainId();
  const localOverlay = useOverlay();
  const { setModals, handlePendingTx } = localOverlay;
  const { chainId, editMode } = useTreeForm();
  const { selectedHat } = useSelectedHat();
  const isConnected = Boolean(address);
  const maxSupply = _.get(selectedHat, 'maxSupply', 0);
  const { data: wearer } = useWearerDetails({
    wearerAddress: address,
    chainId,
    editMode,
  });
  const currentUserIsWearing = useMemo(
    () => _.includes(_.map(wearer || [], 'id'), selectedHat?.id),
    [wearer, selectedHat?.id],
  );

  const currentWearerHats = _.map(wearer, 'id');
  const isAdminUser = isWearingAdminHat(currentWearerHats, selectedHat?.id);
  const { claimHat, hatterIsAdmin, isClaimable } = useHatClaimBy({
    selectedHat,
    chainId,
    wearer: address,
    handlePendingTx,
  });

  const wearerIds = address ? [address] : [];
  const { data: currentUserEligibility } = useWearersEligibilityStatus({
    wearerIds,
    selectedHat,
    chainId,
  });
  const currentUserIsEligible = _.includes(
    _.get(currentUserEligibility, 'eligibleWearers'),
    address,
  );
  const maxWearersReached = _.gte(
    _.toNumber(_.get(selectedHat, 'currentSupply')),
    _.toNumber(maxSupply),
  );

  if (!isConnected) {
    return <ConnectWallet />;
  }

  if (chainId !== currentChainId) return <NetworkSwitcher />;

  // PRIORITIZE ADMIN ACTIONS (INCLUDES BULK OPTIONS)
  if (isAdminUser) {
    let adminTooltip = '';
    if (maxWearersReached) {
      adminTooltip = 'Maximum number of wearers reached.';
    } else if (chainId !== currentNetworkId) {
      adminTooltip = "You can't add a wearer on a different chain.";
    }

    return (
      <Tooltip
        label={adminTooltip}
        fontSize='md'
        isDisabled={!maxWearersReached && chainId === currentNetworkId}
        shouldWrapChildren
      >
        <Button
          variant='outlineMatch'
          colorScheme='blue.500'
          isDisabled={maxWearersReached || chainId !== currentNetworkId}
          onClick={() =>
            !maxWearersReached ? setModals?.({ newWearer: true }) : {}
          }
        >
          Add wearer
        </Button>
      </Tooltip>
    );
  }

  if (
    (currentUserIsEligible as boolean) &&
    isClaimable &&
    !currentUserIsWearing
  )
    return (
      <Tooltip
        label={
          !hatterIsAdmin
            ? 'Hatter must be wearing an admin hat to claim this hat.'
            : undefined
        }
        fontSize='md'
        shouldWrapChildren
      >
        <Button
          variant='outlineMatch'
          colorScheme='blue.500'
          isDisabled={
            !claimHat || !hatterIsAdmin || chainId !== currentNetworkId
          }
          onClick={claimHat}
        >
          Claim Hat
        </Button>
      </Tooltip>
    );

  return null;
};

export default MainAction;
