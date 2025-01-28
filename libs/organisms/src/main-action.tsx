'use client';

import { useOverlay, useSelectedHat, useTreeForm } from 'contexts';
import { useWearerDetails, useWearersEligibilityStatus } from 'hats-hooks';
import { isWearingAdminHat } from 'hats-utils';
import _ from 'lodash';
import { useHatClaimBy } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { Button, Tooltip } from 'ui';
import { Hex } from 'viem';
import { useAccount, useChainId } from 'wagmi';

const ConnectWallet = dynamic(() => import('molecules').then((mod) => mod.ConnectWallet));
const NetworkSwitcher = dynamic(() => import('molecules').then((mod) => mod.NetworkSwitcher));

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
    wearerAddress: address as Hex,
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
    wearer: address as Hex,
    handlePendingTx,
  });

  const wearerIds = address ? ([address] as Hex[]) : [];
  const { data: currentUserEligibility } = useWearersEligibilityStatus({
    wearerIds,
    selectedHat,
    chainId,
  });
  const currentUserIsEligible = _.includes(_.get(currentUserEligibility, 'eligibleWearers'), address);
  const maxWearersReached = _.gte(_.toNumber(_.get(selectedHat, 'currentSupply')), _.toNumber(maxSupply));

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
      <Tooltip label={adminTooltip}>
        <Button
          variant='outline-blue'
          disabled={maxWearersReached || chainId !== currentNetworkId}
          onClick={() => (!maxWearersReached ? setModals?.({ newWearer: true }) : {})}
        >
          Add wearer
        </Button>
      </Tooltip>
    );
  }

  if ((currentUserIsEligible as boolean) && isClaimable && !currentUserIsWearing)
    return (
      <Tooltip label={!hatterIsAdmin ? 'Hatter must be wearing an admin hat to claim this hat.' : undefined}>
        <Button
          variant='outline-blue'
          disabled={!claimHat || !hatterIsAdmin || chainId !== currentNetworkId}
          onClick={claimHat}
        >
          Claim Hat
        </Button>
      </Tooltip>
    );

  return null;
};

export { MainAction };
