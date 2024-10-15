'use client';

import { Button, HStack, Icon, Link, Text, Tooltip } from '@chakra-ui/react';
import { CONFIG } from '@hatsprotocol/constants';
import { hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { useEligibility, useOverlay } from 'contexts';
import { useWearerDetails } from 'hats-hooks';
import { capitalize, includes, map } from 'lodash';
import { useClaimFn } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { BsArrowRight } from 'react-icons/bs';
import { idToIp } from 'shared';
import { AppHat } from 'types';
import { Hex } from 'viem';
import { useAccount, useChainId } from 'wagmi';

const HatIcon = dynamic(() => import('icons').then((mod) => mod.HatIcon));
const NetworkSwitcher = dynamic(() =>
  import('molecules').then((mod) => mod.NetworkSwitcher),
);

export const ClaimButton = () => {
  const { address } = useAccount();
  const currentChainId = useChainId();
  const { handlePendingTx } = useOverlay();
  const {
    chainId,
    selectedHat,
    moduleParameters,
    moduleDetails,
    controllerAddress,
    isClaimableFor,
    hatterIsAdmin,
    requireHatter,
    isEligible: isReadyToClaim, // TODO fix
  } = useEligibility();

  const { data: wearer } = useWearerDetails({
    wearerAddress: address as Hex,
    chainId,
  });
  const isWearing = includes(map(wearer, 'id'), selectedHat?.id);

  const { handleClaim, disableClaim, disableReason, isLoading, isEligible } =
    useClaimFn({
      selectedHat: selectedHat as AppHat,
      handlePendingTx,
      moduleParameters,
      moduleDetails,
      controllerAddress,
      chainId,
      isReadyToClaim,
    });

  const hatUrl = selectedHat?.id
    ? `${CONFIG.APP_URL}/trees/${chainId}/${hatIdToTreeId(
        BigInt(selectedHat.id),
      )}?hatId=${idToIp(selectedHat.id)}`
    : '#';

  if (isWearing && isEligible) {
    return (
      <Button
        as={Link}
        href={hatUrl}
        colorScheme='green'
        leftIcon={<Icon as={HatIcon} color='white' />}
        rightIcon={<Icon as={BsArrowRight} color='white' />}
        isExternal
      >
        View your hat
      </Button>
    );
  }

  let hatterIfNeeded = false;
  // check hatter if needed
  if (requireHatter) {
    // hatter must be an admin wearer
    // can't claim if not claimable for - module claims on behalf of user
    hatterIfNeeded = !hatterIsAdmin || !isClaimableFor;
  }

  let tooltip = '';
  if (!address) {
    tooltip = 'Connect your wallet to claim';
  }
  if (requireHatter && !hatterIsAdmin) {
    tooltip = 'There is no claims hatter enabled for this tree';
  }
  if (requireHatter && !isClaimableFor) {
    tooltip = 'Ensure any address can claim on behalf of wearers';
  }
  if (isWearing && isEligible) {
    tooltip = 'You are already wearing this hat';
  }
  // TODO check supply of hat

  if (currentChainId !== chainId) {
    return <NetworkSwitcher chainId={chainId} />;
  }

  return (
    <Tooltip label={tooltip || disableReason}>
      <Button
        variant='primary'
        // won't hit this flow if wrong network
        isDisabled={
          hatterIfNeeded ||
          disableClaim ||
          (isWearing && isEligible) ||
          !address ||
          currentChainId !== chainId
        } // handle isReadyToClaim on respective disableClaims
        onClick={handleClaim}
        isLoading={isLoading}
      >
        <HStack>
          <HatIcon />
          <Text>Claim this {capitalize(CONFIG.TERMS.hat)}</Text>
        </HStack>
      </Button>
    </Tooltip>
  );
};
