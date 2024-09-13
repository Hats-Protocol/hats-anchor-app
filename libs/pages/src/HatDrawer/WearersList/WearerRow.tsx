'use client';

import {
  Button,
  Flex,
  Icon,
  IconButton,
  Image,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { useOverlay, useSelectedHat, useTreeForm } from 'contexts';
import { useHatBurn, useHatContractWrite } from 'hats-hooks';
import { getControllerNameAndLink, isTopHat } from 'hats-utils';
import { useClipboard, useWaitForSubgraph } from 'hooks';
import { filter, get, isEmpty, toLower } from 'lodash';
import { useModuleDetails } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { idToIp, toTreeId } from 'shared';
import { ControllerData } from 'types';
import { fetchHatDetails, formatAddress, isSameAddress } from 'utils';
import { Hex } from 'viem';
import { useAccount, useChainId, useEnsAvatar } from 'wagmi';

const CodeIcon = dynamic(() => import('icons').then((mod) => mod.CodeIcon));
const CopyAddress = dynamic(() =>
  import('icons').then((mod) => mod.CopyAddress),
);
const WearerIcon = dynamic(() => import('icons').then((mod) => mod.WearerIcon));
const TooltipWrapper = dynamic(() =>
  import('molecules').then((mod) => mod.TooltipWrapper),
);
const ChakraNextLink = dynamic(() =>
  import('ui').then((mod) => mod.ChakraNextLink),
);

const WearerRow = ({
  wearer,
  isIneligible,
  currentUserIsAdmin,
  setChangeStatusWearer,
  setWearerToTransferFrom,
}: WearerRowProps) => {
  const currentNetworkId = useChainId();
  const { setModals, handlePendingTx } = useOverlay();
  const { address } = useAccount();
  const { chainId } = useTreeForm();
  const { selectedHat } = useSelectedHat();
  // const { isMobile } = useMediaStyles();
  const { onCopy: copyAddress } = useClipboard(wearer.id, {
    toastData: {
      title: 'Copied address',
      description: 'Successfully copied address to clipboard',
    },
  });

  const { data: ensAvatar } = useEnsAvatar({
    chainId: 1,
    name: wearer?.ensName || undefined,
  });

  const hatId = selectedHat?.id || '0x';
  const isSameChain = chainId === currentNetworkId;
  const currentUserIsEligibility =
    selectedHat?.eligibility === toLower(address);

  // TODO should be able to say "Removed hat for wearer", add uses claim for
  const txDescription = `Revoked hat #${idToIp(hatId)} from ${formatAddress(
    wearer.id,
  )}`;

  const checkEligibilityWaitForSubgraph = useWaitForSubgraph({
    fetchHelper: () => fetchHatDetails(hatId, chainId),
    checkResult: (hatDetails) =>
      isEmpty(
        filter(hatDetails?.wearers, (w) => toLower(w.id) === toLower(address)),
      ),
  });

  const { writeAsync: updateEligibility, isLoading } = useHatContractWrite({
    functionName: 'checkHatWearerStatus',
    args: [hatIdHexToDecimal(hatId), wearer.id],
    chainId,
    // TODO re-add check for isContract
    // enabled: Boolean(hatId) && Boolean(wearer) && chainId === currentNetworkId,
    queryKeys: [
      ['hatDetails', { id: hatId, chainId }],
      ['treeDetails', toTreeId(hatId)],
    ],
    handlePendingTx,
    waitForSubgraph: checkEligibilityWaitForSubgraph,
    txDescription,
    successToastData: {
      title: txDescription,
    },
  });

  const { details: moduleDetails } = useModuleDetails({
    address: wearer.id,
    chainId,
    enabled: wearer.isContract,
  });

  const renounceWaitForSubgraph = useWaitForSubgraph({
    fetchHelper: () => fetchHatDetails(hatId, chainId),
    checkResult: (hatDetails) =>
      isEmpty(
        filter(hatDetails?.wearers, (w) => toLower(w.id) === toLower(address)),
      ),
  });

  const { writeAsync: renounceHat } = useHatBurn({
    selectedHat,
    chainId,
    handlePendingTx,
    waitForSubgraph: renounceWaitForSubgraph,
  });

  const handleRenounceHat = async () => {
    renounceHat?.().catch((e) => {
      // eslint-disable-next-line no-console
      console.error(e);
    });
  };

  let icon = WearerIcon;
  if (wearer.isContract) {
    icon = CodeIcon;
  }

  const { name: controllerName, icon: controllerIcon } =
    getControllerNameAndLink({
      extendedController: wearer,
      moduleDetails,
      chainId,
    });

  let bgColor = 'transparent';
  let color = 'Informative-Human';
  if (isIneligible) {
    color = 'gray.500';
  } else if (isSameAddress(wearer.id, address)) {
    bgColor = 'green.100';
    color = 'green.800';
  } else if (wearer.isContract && !controllerName.includes('Safe')) {
    color = 'Informative-Code';
  }

  const displayName =
    get(wearer, 'ensName') ||
    controllerName ||
    formatAddress(get(wearer, 'id'));
  const wearerNameIsAddress = displayName === formatAddress(wearer.id);

  return (
    <Flex key={wearer.id} justifyContent='space-between' alignItems='center'>
      <ChakraNextLink href={`/wearers/${wearer.id}`}>
        <Tooltip label={!wearerNameIsAddress && wearer.id} minW='380px'>
          <Flex alignItems='center' gap={1} backgroundColor={bgColor} pr={1}>
            {ensAvatar ? (
              <Image
                w={{ base: '11px', md: 3 }}
                h={{ base: '14px', md: 4 }}
                ml='2px'
                mr={{ base: '1px', md: 1 }} // sometimes only ml? oh when the current user isn't a wearer in the list?
                src={ensAvatar}
                borderRadius='2px'
                objectFit='cover'
              />
            ) : (
              <Icon
                as={controllerIcon || icon}
                color={color}
                boxSize={{ base: '14px', md: 4 }}
              />
            )}

            <Text color={color} size={{ base: 'sm', md: 'md' }}>
              {displayName}
            </Text>
          </Flex>
        </Tooltip>
      </ChakraNextLink>

      <Flex alignItems='center' gap={1}>
        {!isIneligible && // don't transfer when you can revoke
          currentUserIsAdmin && // admins can transfer
          (wearer.id !== toLower(address) || isTopHat(selectedHat)) && ( // prefer to renounce if wearer, unless top hat
            <TooltipWrapper
              isSameChain={isSameChain}
              label="You can't transfer a hat on a different chain"
            >
              <Button
                variant='ghost'
                size='xs'
                color='Functional-LinkSecondary'
                isDisabled={!isSameChain}
                onClick={() => {
                  setModals?.({ transferHat: true });
                  setWearerToTransferFrom(wearer.id);
                }}
              >
                Transfer
              </Button>
            </TooltipWrapper>
          )}

        {isIneligible && ( // when ineligible, we use same rows
          <Button
            variant='ghost'
            size='xs'
            color='red.500'
            fontWeight='medium'
            isLoading={isLoading}
            onClick={updateEligibility}
          >
            Revoke
          </Button>
        )}

        {!isSameAddress(wearer.id, address) &&
          currentUserIsEligibility && ( // eligibility can revoke
            <TooltipWrapper
              isSameChain={isSameChain}
              label="You can't revoke a hat on a different chain"
            >
              <Button
                variant='link'
                color='red.500'
                size='xs'
                isDisabled={!isSameChain}
                onClick={() => {
                  setModals?.({ hatWearerStatus: true });
                  setChangeStatusWearer(wearer.id);
                }}
              >
                Revoke
              </Button>
            </TooltipWrapper>
          )}

        {!isSameAddress(wearer.id, address) ? ( // if not current user, show copy button
          <IconButton
            icon={<Icon as={CopyAddress} boxSize={4} color='blue.500' />}
            p={0}
            size='xs'
            variant='link'
            aria-label='Copy wearer address'
            onClick={copyAddress}
          />
        ) : (
          !isTopHat(selectedHat) && // don't allow top hats to renounce
          !isIneligible && ( // prefer revoke to renounce when ineligible
            <TooltipWrapper
              isSameChain={isSameChain}
              label="You can't renounce a hat on a different chain"
            >
              <Button
                variant='link'
                size='xs'
                color='red.500'
                fontWeight='medium'
                bg='transparent'
                isDisabled={!isSameChain || !renounceHat}
                onClick={handleRenounceHat}
              >
                Renounce
              </Button>
            </TooltipWrapper>
          )
        )}
      </Flex>
    </Flex>
  );
};

export default WearerRow;

interface WearerRowProps {
  wearer: ControllerData;
  isIneligible?: boolean;
  currentUserIsAdmin?: boolean;
  setChangeStatusWearer: (w: Hex) => void;
  setWearerToTransferFrom: (w: Hex) => void;
}
