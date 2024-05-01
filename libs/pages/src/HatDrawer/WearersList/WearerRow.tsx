import {
  Button,
  Flex,
  Icon,
  IconButton,
  Image,
  Text,
  Tooltip,
  useClipboard,
} from '@chakra-ui/react';
import { hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { useOverlay, useSelectedHat, useTreeForm } from 'contexts';
import { useHatBurn, useHatContractWrite, useModuleDetails } from 'hats-hooks';
import { getControllerNameAndLink, isTopHat } from 'hats-utils';
import { useToast, useWaitForSubgraph } from 'hooks';
import _ from 'lodash';
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
  import('ui').then((mod) => mod.TooltipWrapper),
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
  const toast = useToast();
  const currentNetworkId = useChainId();
  const { setModals, handlePendingTx } = useOverlay();
  const { address } = useAccount();
  const { chainId } = useTreeForm();
  const { selectedHat } = useSelectedHat();
  // const { isMobile } = useMediaStyles();
  const { onCopy } = useClipboard(wearer.id);

  const { data: ensAvatar } = useEnsAvatar({
    chainId: 1,
    name: wearer?.ensName,
    enabled: !!wearer?.ensName,
  });

  const hatId = selectedHat?.id;
  const isSameChain = chainId === currentNetworkId;
  const currentUserIsEligibility =
    selectedHat?.eligibility === _.toLower(address);

  // TODO should be able to say "Removed hat for wearer", add uses claim for
  const txDescription = `Revoked hat #${idToIp(hatId)} from ${formatAddress(
    wearer.id,
  )}`;
  const { extendedEligibility } = _.pick(selectedHat, ['extendedEligibility']);

  const { writeAsync: updateEligibility, isLoading } = useHatContractWrite({
    functionName: 'checkHatWearerStatus',
    args: [hatIdHexToDecimal(hatId), wearer.id],
    chainId,
    enabled:
      Boolean(hatId) &&
      Boolean(wearer) &&
      extendedEligibility?.isContract &&
      chainId === currentNetworkId,
    queryKeys: [
      ['hatDetails', { id: hatId, chainId }],
      ['treeDetails', toTreeId(hatId)],
    ],
    handlePendingTx,
    txDescription,
    onSuccessToastData: {
      title: txDescription,
    },
  });

  const { details: moduleDetails } = useModuleDetails({
    address: wearer.id,
    chainId,
    enabled: wearer.isContract,
  });

  const waitForSubgraph = useWaitForSubgraph({
    fetchHelper: () => fetchHatDetails(hatId, chainId),
    checkResult: (hatDetails) =>
      _.isEmpty(
        _.filter(
          hatDetails?.wearers,
          (w) => _.toLower(w.id) === _.toLower(address),
        ),
      ),
  });

  const { writeAsync: renounceHat } = useHatBurn({
    selectedHat,
    chainId,
    handlePendingTx,
    waitForSubgraph,
  });

  const handleRenounceHat = async () => {
    renounceHat?.().catch((e) => {
      // eslint-disable-next-line no-console
      console.error(e);
    });
  };

  const copyAddress = () => {
    onCopy();
    toast.info({
      title: 'Copied address',
      description: 'Successfully copied address to clipboard',
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
  } else if (wearer.isContract && controllerName !== 'Safe Multisig') {
    color = 'Informative-Code';
  }

  const displayName =
    _.get(wearer, 'ensName') ||
    controllerName ||
    formatAddress(_.get(wearer, 'id'));
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
          (wearer.id !== _.toLower(address) || isTopHat(selectedHat)) && ( // prefer to renounce if wearer, unless top hat
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
                variant='ghost'
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
            variant='ghost'
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
                variant='ghost'
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
  setWearerToTransferFrom: (w: string) => void;
}
