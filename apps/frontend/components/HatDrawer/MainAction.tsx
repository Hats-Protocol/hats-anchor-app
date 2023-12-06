/* eslint-disable no-nested-ternary */
import { Button, HStack, Text, Tooltip } from '@chakra-ui/react';
import {
  useHatClaim,
  useWearerDetails,
  useWearerEligibilityCheck,
} from 'hats-hooks';
import { isWearingAdminHat } from 'hats-utils';
import _ from 'lodash';
import { useMemo } from 'react';
// import { FaPlus } from 'react-icons/fa';
import { useAccount, useChainId, useNetwork } from 'wagmi';

import { useOverlay } from '../../contexts/OverlayContext';
import { useTreeForm } from '../../contexts/TreeFormContext';
import ConnectWallet from '../ConnectWallet';
import NetworkSwitcher from '../NetworkSwitcher';

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
  const { claimHat, hatterIsAdmin, isClaimable } = useHatClaim({
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
    _.get(selectedHat, 'currentSupply'),
    maxSupply,
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
          <HStack>
            {/* <FaPlus /> */}
            <Text>Claim Hat</Text>
          </HStack>
        </Button>
      </Tooltip>
    );

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
          variant='outlineMatch'
          colorScheme='blue.500'
          isDisabled={maxWearersReached || chainId !== currentNetworkId}
          onClick={() =>
            !maxWearersReached ? setModals?.({ newWearer: true }) : {}
          }
        >
          <HStack
          // cursor={maxWearersReached ? 'not-allowed' : 'pointer'}
          // color={maxWearersReached ? 'gray.500' : 'blue.500'}
          >
            <Text variant='ghost'>Add wearer</Text>
          </HStack>
        </Button>
      </Tooltip>
    );
  }

  return null;
};

export default MainAction;
