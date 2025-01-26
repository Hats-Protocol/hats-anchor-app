'use client';

import { HATS_V1 } from '@hatsprotocol/sdk-v1-core';
import { useOverlay, useSelectedHat, useTreeForm } from 'contexts';
import { useWearerDetails } from 'hats-hooks';
import { useClipboard } from 'hooks';
import { includes, map } from 'lodash';
import { useHatClaimBy } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { FaCopy, FaEllipsisV } from 'react-icons/fa';
import { Button, cn, DropdownMenu, DropdownMenuItem, DropdownMenuPortal, DropdownMenuTrigger } from 'ui';
import { Hex } from 'viem';
import { useAccount, useChainId } from 'wagmi';

const HatIcon = dynamic(() => import('icons').then((mod) => mod.HatIcon));

const MobileBottomMenu = ({ show = false }: { show: boolean | undefined }) => {
  const { handlePendingTx } = useOverlay();
  const currentNetworkId = useChainId();
  const { chainId } = useTreeForm();
  const { selectedHat } = useSelectedHat();
  const { onCopy: copyHatId } = useClipboard(selectedHat?.id || '', {
    toastData: { title: 'Successfully copied hat ID to clipboard' },
  });
  const { onCopy: copyContractAddress } = useClipboard(HATS_V1, {
    toastData: { title: 'Successfully copied contract address to clipboard' },
  });
  const { address } = useAccount();

  const { claimHat, hatterIsAdmin, isClaimable } = useHatClaimBy({
    selectedHat,
    chainId,
    wearer: address as Hex,
    handlePendingTx,
  });

  const { data: wearer } = useWearerDetails({
    wearerAddress: address as Hex,
    chainId,
  });
  const isWearing = includes(map(wearer, 'id'), selectedHat?.id);

  return (
    <div className={cn('z-14 bg-whiteAlpha-900 fixed bottom-0 w-full', show ? 'block' : 'hidden')}>
      <div
        className={cn(
          'flex items-center justify-between border-t border-gray-200 p-2',
          isClaimable && !isWearing && hatterIsAdmin ? 'justify-between' : 'justify-end',
        )}
      >
        {!!isClaimable && !isWearing && !!hatterIsAdmin && (
          <Button
            variant='outline-blue'
            disabled={!claimHat || !hatterIsAdmin || chainId !== currentNetworkId}
            onClick={claimHat}
          >
            <HatIcon className='mr-1 size-4 text-white' />
            Claim Hat
          </Button>
        )}

        <div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant='outline'>
                <FaEllipsisV />
                More
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuPortal>
              <DropdownMenuItem onClick={copyHatId}>
                <FaCopy className='mr-2' />
                Copy hat ID
              </DropdownMenuItem>
              <DropdownMenuItem onClick={copyContractAddress}>
                <FaCopy className='mr-2' />
                Copy contract ID
              </DropdownMenuItem>
            </DropdownMenuPortal>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export { MobileBottomMenu };
