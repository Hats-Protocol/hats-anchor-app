/* eslint-disable no-nested-ternary */
import { Button, HStack, Text, Tooltip } from '@chakra-ui/react';
import _ from 'lodash';
import { useMemo } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useAccount, useChainId } from 'wagmi';

import { useOverlay } from '@/contexts/OverlayContext';
import { useTreeForm } from '@/contexts/TreeFormContext';
import useHatClaim from '@/hooks/useHatClaim';
import useWearerDetails from '@/hooks/useWearerDetails';
import useWearerEligibilityCheck from '@/hooks/useWearerEligibilityCheck';
import { isWearingAdminHat } from '@/lib/hats';

import ConnectWallet from '../ConnectWallet';

const MainAction = ({
  currentUserIsWearing,
}: {
  currentUserIsWearing: boolean;
}) => {
  const currentNetworkId = useChainId();
  const { address } = useAccount();
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;
  const { chainId, selectedHat, editMode } = useTreeForm();
  const isConnected = Boolean(address);
  const maxSupply = _.get(selectedHat, 'maxSupply', 0);
  const wearers = useMemo(() => {
    return _.get(selectedHat, 'extendedWearers', []);
  }, [selectedHat]);
  const { data: wearer } = useWearerDetails({
    wearerAddress: address,
    chainId,
    editMode,
  });

  const currentWearerHats = _.map(wearer, 'id');
  const isAdminUser = isWearingAdminHat(
    currentWearerHats,
    selectedHat?.id,
    true,
  );
  const { claimHat, hatterIsAdmin, isClaimable } = useHatClaim({
    wearer: address,
  });

  const { data: currentUserIsEligible } = useWearerEligibilityCheck({
    wearer: address,
  });
  const maxWearersReached = _.gte(_.size(wearers), maxSupply);

  const claimTooltip = useMemo(() => {
    if (chainId !== currentNetworkId)
      return "You can't claim a hat on a different chain.";
    if (!hatterIsAdmin)
      return 'Hatter must be wearing an admin hat to claim this hat.';
    return undefined;
  }, [chainId, currentNetworkId, hatterIsAdmin]);

  if (!isConnected) {
    return <ConnectWallet />;
  }

  if (isAdminUser) {
    return (
      <Tooltip
        label={
          maxWearersReached
            ? 'Maximum number of wearers reached.'
            : chainId !== currentNetworkId
            ? "You can't add a wearer on a different chain."
            : ''
        }
        fontSize='md'
        isDisabled={!maxWearersReached && chainId === currentNetworkId}
        shouldWrapChildren
      >
        <Button
          variant='unstyled'
          isDisabled={maxWearersReached || chainId !== currentNetworkId}
          onClick={() =>
            !maxWearersReached ? setModals?.({ newWearer: true }) : {}
          }
        >
          <HStack
            cursor={maxWearersReached ? 'not-allowed' : 'pointer'}
            color={maxWearersReached ? 'gray.500' : 'blue.500'}
          >
            <FaPlus />
            <Text variant='ghost'>Add a wearer</Text>
          </HStack>
        </Button>
      </Tooltip>
    );
  }

  if (
    (currentUserIsEligible as boolean) &&
    !!isClaimable &&
    !currentUserIsWearing
  )
    return (
      <Tooltip label={claimTooltip} fontSize='md' shouldWrapChildren>
        <Button
          variant='unstyled'
          isDisabled={
            !claimHat || !hatterIsAdmin || chainId !== currentNetworkId
          }
          onClick={claimHat}
        >
          <HStack color='blue.500'>
            <FaPlus />
            <Text variant='ghost'>Claim Hat</Text>
          </HStack>
        </Button>
      </Tooltip>
    );

  return null;
};

export default MainAction;
