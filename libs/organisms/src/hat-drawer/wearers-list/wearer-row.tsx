'use client';

import { hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { useOverlay, useSelectedHat, useTreeForm } from 'contexts';
import { useHatBurn, useHatContractWrite } from 'hats-hooks';
import { getControllerNameAndLink, isTopHat } from 'hats-utils';
import { useClipboard, useWaitForSubgraph } from 'hooks';
import { get, toLower } from 'lodash';
import { useModuleDetails } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { idToIp } from 'shared';
import { ControllerData } from 'types';
import { Button, cn, Link, OblongAvatar, Tooltip } from 'ui';
import { formatAddress, isSameAddress } from 'utils';
import { Hex } from 'viem';
import { useAccount, useChainId, useEnsAvatar } from 'wagmi';

const CodeIcon = dynamic(() => import('icons').then((mod) => mod.CodeIcon));
const CopyAddress = dynamic(() => import('icons').then((mod) => mod.CopyAddress));
const WearerIcon = dynamic(() => import('icons').then((mod) => mod.WearerIcon));
const TooltipWrapper = dynamic(() => import('molecules').then((mod) => mod.TooltipWrapper));

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
  const { onCopy: copyAddress } = useClipboard(wearer.id, {
    toastData: {
      title: 'Copied address',
      // description: 'Successfully copied address to clipboard',
    },
  });

  const { data: ensAvatar } = useEnsAvatar({
    chainId: 1,
    name: wearer?.ensName || undefined,
  });

  const hatId = selectedHat?.id || '0x';
  const isSameChain = chainId === currentNetworkId;
  const currentUserIsEligibility = selectedHat?.eligibility === toLower(address);

  // TODO should be able to say "Removed hat for wearer", add uses claim for
  const txDescription = `Revoked hat #${idToIp(hatId)} from ${formatAddress(wearer.id)}`;

  const waitForSubgraph = useWaitForSubgraph({ chainId });

  const { writeAsync: updateEligibility, isLoading } = useHatContractWrite({
    functionName: 'checkHatWearerStatus',
    args: [hatIdHexToDecimal(hatId), wearer.id],
    chainId,
    queryKeys: [['hatDetails'], ['treeDetails'], ['wearerDetails']],
    handlePendingTx,
    waitForSubgraph,
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

  const { writeAsync: renounceHat } = useHatBurn({
    selectedHat,
    chainId,
    handlePendingTx,
    waitForSubgraph,
  });

  const handleRenounceHat = async () => {
    // TODO check that they're wearing the hat currently
    renounceHat?.().catch((e) => {
      // eslint-disable-next-line no-console
      console.error(e);
    });
  };

  let icon = WearerIcon;
  if (wearer.isContract) {
    icon = CodeIcon;
  }

  const { name: controllerName, icon: controllerIcon } = getControllerNameAndLink({
    extendedController: wearer,
    moduleDetails,
    chainId,
  });

  let bgColor = 'transparent';
  let color = 'text-informative-human';
  if (isIneligible) {
    color = 'text-gray-500';
  } else if (isSameAddress(wearer.id, address)) {
    bgColor = 'bg-green-100';
    color = 'text-green-800';
  } else if (wearer.isContract && !controllerName.includes('Safe')) {
    color = 'text-informative-code';
  }

  const displayName = get(wearer, 'ensName') || controllerName || formatAddress(get(wearer, 'id'));
  const wearerNameIsAddress = displayName === formatAddress(wearer.id);
  const Icon = controllerIcon || icon;

  return (
    <div className='flex w-full items-center justify-between' key={wearer.id}>
      <Link href={`/wearers/${wearer.id}`} className=''>
        <Tooltip label={!wearerNameIsAddress ? wearer.id : undefined}>
          <div className={cn('flex items-center gap-2 pr-1', bgColor)}>
            {ensAvatar ? (
              <OblongAvatar src={ensAvatar} className='h-5 w-4 rounded-[2px]' />
            ) : (
              <Icon className={cn('size-4', color)} />
            )}

            <p className={cn(color)}>{displayName}</p>
          </div>
        </Tooltip>
      </Link>

      <div className='flex items-center gap-2'>
        {!isIneligible && // don't transfer when you can revoke
          currentUserIsAdmin && // admins can transfer
          (wearer.id !== toLower(address) || isTopHat(selectedHat)) && ( // prefer to renounce if wearer, unless top hat
            <TooltipWrapper isSameChain={isSameChain} label="You can't transfer a hat on a different chain">
              <Button
                variant='link'
                size='xs'
                className='text-functional-link-primary'
                disabled={!isSameChain}
                onClick={() => {
                  setModals?.({ transferHat: true });
                  setWearerToTransferFrom(wearer.id);
                }}
              >
                Transfer
              </Button>
            </TooltipWrapper>
          )}

        {!isSameAddress(wearer.id, address) &&
          currentUserIsEligibility && ( // eligibility can revoke
            <TooltipWrapper isSameChain={isSameChain} label="You can't revoke a hat on a different chain">
              <Button
                variant='link'
                className='text-destructive hover:text-destructive/80 font-medium hover:no-underline'
                size='xs'
                disabled={!isSameChain}
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
          <Button
            size='xs'
            variant='link'
            aria-label='Copy wearer address'
            className='text-functional-link-primary hover:text-functional-link-primary/80 hover:no-underline'
            onClick={copyAddress}
          >
            <CopyAddress className='size-4' />
            Copy
          </Button>
        ) : (
          !isTopHat(selectedHat) && // don't allow top hats to renounce
          !isIneligible && ( // prefer revoke to renounce when ineligible
            <TooltipWrapper isSameChain={isSameChain} label="You can't renounce a hat on a different chain">
              <Button
                variant='link'
                size='xs'
                className='text-destructive bg-transparent font-medium'
                disabled={!isSameChain || !renounceHat}
                onClick={handleRenounceHat}
              >
                Renounce
              </Button>
            </TooltipWrapper>
          )
        )}

        {isIneligible && ( // when ineligible, we use same rows
          <Button
            variant='link'
            size='xs'
            className='text-destructive font-medium'
            disabled={isLoading}
            onClick={updateEligibility}
          >
            Reconcile
          </Button>
        )}
      </div>
    </div>
  );
};

interface WearerRowProps {
  wearer: ControllerData;
  isIneligible?: boolean;
  currentUserIsAdmin?: boolean;
  setChangeStatusWearer: (w: Hex) => void;
  setWearerToTransferFrom: (w: Hex) => void;
}

export { WearerRow };
