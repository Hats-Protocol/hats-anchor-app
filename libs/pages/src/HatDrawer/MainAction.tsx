import { Button, Tooltip } from '@chakra-ui/react';
import { useOverlay, useTreeForm } from 'contexts';
import {
  useHatClaimBy,
  useWearerDetails,
  useWearerEligibilityCheck,
} from 'hats-hooks';
import { isWearingAdminHat } from 'hats-utils';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { useAccount, useChainId, useNetwork } from 'wagmi';

const ConnectWallet = dynamic(() =>
  import('ui').then((mod) => mod.ConnectWallet),
);
const NetworkSwitcher = dynamic(() =>
  import('ui').then((mod) => mod.NetworkSwitcher),
);

const MainAction = () => {
  const currentNetworkId = useChainId();
  const { address } = useAccount();
  const { chain } = useNetwork();
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;
  const { chainId, selectedHat, editMode } = useTreeForm();
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
  const isAdminUser = isWearingAdminHat(
    currentWearerHats,
    selectedHat?.id,
    true,
  );
  const { claimHat, hatterIsAdmin, isClaimable } = useHatClaimBy({
    selectedHat,
    chainId,
    wearer: address,
  });

  const { data: currentUserIsEligible } = useWearerEligibilityCheck({
    wearer: address,
    selectedHat,
    chainId,
  });
  const maxWearersReached = _.gte(
    _.toNumber(_.get(selectedHat, 'currentSupply')),
    _.toNumber(maxSupply),
  );

  if (!isConnected) {
    return <ConnectWallet />;
  }

  if (chainId !== chain?.id) return <NetworkSwitcher />;

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

  return null;
};

export default MainAction;
