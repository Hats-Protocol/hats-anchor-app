'use client';

import { MUTABILITY } from '@hatsprotocol/constants';
import { hatIdHexToDecimal, HATS_V1 } from '@hatsprotocol/sdk-v1-core';
import { Modal, useOverlay, useSelectedHat, useTreeForm } from 'contexts';
import { useHatContractWrite, useHatMakeImmutable, useHatStatusCheck, useWearerDetails } from 'hats-hooks';
import { handleExportBranch, isWearingAdminHat } from 'hats-utils';
import { useClipboard, useToast, useWaitForSubgraph } from 'hooks';
import { map } from 'lodash';
import posthog from 'posthog-js';
import { FaCopy, FaDoorOpen, FaEllipsisV, FaExclamationCircle, FaLink, FaLock, FaPowerOff } from 'react-icons/fa';
import { TbChartDots3 } from 'react-icons/tb';
import { idToIp } from 'shared';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Link,
  Tooltip,
} from 'ui';
import { getDisabledReason, isSameAddress } from 'utils';
import { Hex } from 'viem';
import { useAccount, useChainId } from 'wagmi';

const MoreMenu = () => {
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;

  const { chainId, treeToDisplayWithInactiveHats, storedData, linkedHatIds, onchainHats } = useTreeForm();
  const { selectedHat, isClaimable } = useSelectedHat();

  const { address } = useAccount();
  const currentNetworkId = useChainId();
  const toast = useToast();
  const { handlePendingTx } = useOverlay();

  const { data: wearer } = useWearerDetails({
    wearerAddress: address as Hex,
    chainId,
  });

  const isAdminUser = isWearingAdminHat(map(wearer, 'id'), selectedHat?.id);

  const mutableStatus = selectedHat?.mutable ? MUTABILITY.MUTABLE : 'Immutable';

  const { writeAsync: updateImmutability, isLoading: isLoadingUpdateImmutability } = useHatMakeImmutable({
    selectedHat,
    onchainHats,
    chainId,
    isAdminUser,
    mutable: selectedHat?.mutable,
    handlePendingTx,
  });

  const txDescription = `${selectedHat?.status ? 'Deactivated' : 'Activated'} hat ${idToIp(selectedHat?.id)}`;

  const waitForSubgraph = useWaitForSubgraph({ chainId });

  const { writeAsync: toggleHat, isLoading: isLoadingToggleHat } = useHatContractWrite({
    functionName: 'setHatStatus',
    args: [selectedHat?.id, !selectedHat?.status],
    chainId,
    txDescription,
    successToastData: {
      title: 'Hat Status Updated!',
      description: txDescription,
    },
    queryKeys: [['hatDetails'], ['treeDetails']],
    handlePendingTx,
    waitForSubgraph,
  });

  const {
    writeAsync: checkHatStatus,
    isLoading: isLoadingCheckHatStatus,
    toggleIsContract,
  } = useHatStatusCheck({
    chainId,
    hatData: selectedHat,
    handlePendingTx,
  });

  const { onCopy: copyHatId } = useClipboard(selectedHat?.id || '', {
    toastData: {
      title: 'Copied Hat Hex ID',
      // description: `Copied ${selectedHat?.id?.slice(0, 25)}`,
    },
  });
  const { onCopy: copyHatDecimalId } = useClipboard(
    selectedHat?.id ? hatIdHexToDecimal(selectedHat.id).toString() : '',
    {
      toastData: {
        title: 'Copied Hat Decimal ID',
        // description: selectedHat?.id ? `Copied ${hatIdHexToDecimal(selectedHat.id).toString().slice(0, 25)}...` : '',
      },
    },
  );
  const { onCopy: copyContractAddress } = useClipboard(HATS_V1, {
    toastData: { title: 'Successfully copied contract address to clipboard' },
  });

  const handleExport = () =>
    handleExportBranch({
      targetHatId: selectedHat?.id,
      treeToDisplayWithInactiveHats,
      linkedHatIds,
      storedData,
      chainId,
      toast,
    });

  const enableLinking = posthog.isFeatureEnabled('linking');

  if (!selectedHat) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' type='button'>
            <div className='flex items-center gap-1'>
              <FaEllipsisV className='size-4' />
              <p>More</p>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='z-[100]'>
          <div className='gap-5'>
            {/* OFF-CHAIN ACTIONS */}
            <DropdownMenuGroup title='Off-chain Actions'>
              <DropdownMenuItem onClick={handleExport}>
                <TbChartDots3 className='mr-2' />
                Export branch {idToIp(selectedHat?.id)}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={copyHatId}>
                <FaCopy className='mr-2' />
                Copy Hat Hex ID
              </DropdownMenuItem>

              <DropdownMenuItem onClick={copyHatDecimalId}>
                <FaCopy className='mr-2' />
                Copy Hat Decimal ID
              </DropdownMenuItem>

              <DropdownMenuItem onClick={copyContractAddress}>
                <FaCopy className='mr-2' />
                Copy Hats Contract
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <hr className='border-gray-200' />

            {/* ONCHAIN ACTIONS */}
            <DropdownMenuGroup title='On-chain Actions'>
              <div className='flex flex-col gap-0'>
                {address && isClaimable?.by && !isClaimable?.for && (
                  <Tooltip
                    label={getDisabledReason({
                      isNotConnected: !address,
                      isOnWrongNetwork: chainId !== currentNetworkId,
                    })}
                  >
                    <DropdownMenuItem
                      onClick={() => setModals?.({ checkEligibility: true })}
                      disabled={chainId !== currentNetworkId}
                    >
                      <FaExclamationCircle />
                      Check Eligibility
                    </DropdownMenuItem>
                  </Tooltip>
                )}

                <Tooltip
                  label={
                    !toggleIsContract
                      ? 'The toggle is "humanistic"'
                      : chainId !== currentNetworkId
                        ? "You can't test status of a hat on a different chain"
                        : ''
                  }
                >
                  <DropdownMenuItem
                    onClick={() => checkHatStatus?.()}
                    disabled={
                      isLoadingCheckHatStatus || !checkHatStatus || !toggleIsContract || chainId !== currentNetworkId
                    }
                  >
                    <FaDoorOpen />
                    Test hat status
                  </DropdownMenuItem>
                </Tooltip>

                {address && enableLinking && (
                  <Tooltip
                    label={getDisabledReason({
                      isNotConnected: !address,
                      isOnWrongNetwork: chainId !== currentNetworkId,
                    })}
                  >
                    <DropdownMenuItem
                      onClick={() => setModals?.({ requestLink: true })}
                      disabled={chainId !== currentNetworkId}
                    >
                      <FaLink />
                      Request to link tree here
                    </DropdownMenuItem>
                  </Tooltip>
                )}

                {isAdminUser && isSameAddress(selectedHat?.toggle, address) && (
                  <Tooltip
                    label={getDisabledReason({
                      isNotConnected: !address,
                      isOnWrongNetwork: chainId !== currentNetworkId,
                    })}
                  >
                    <DropdownMenuItem
                      onClick={toggleHat}
                      disabled={
                        !isSameAddress(selectedHat?.toggle, address) ||
                        isLoadingToggleHat ||
                        chainId !== currentNetworkId ||
                        !toggleHat
                      }
                    >
                      <FaPowerOff />
                      {selectedHat?.status ? 'Deactivate' : 'Activate'} hat
                    </DropdownMenuItem>
                  </Tooltip>
                )}

                {isAdminUser && (
                  <Tooltip
                    label={getDisabledReason({
                      isNotConnected: !address,
                      isOnWrongNetwork: chainId !== currentNetworkId,
                    })}
                  >
                    <DropdownMenuItem
                      onClick={() => setModals?.({ 'make-hat-immutable': true })}
                      disabled={
                        mutableStatus === MUTABILITY.IMMUTABLE ||
                        !updateImmutability ||
                        chainId !== currentNetworkId ||
                        isLoadingUpdateImmutability
                      }
                    >
                      <FaLock />
                      Make immutable
                    </DropdownMenuItem>
                  </Tooltip>
                )}
              </div>
            </DropdownMenuGroup>

            <hr className='border-gray-200' />

            {/* REPORT */}

            <DropdownMenuItem asChild>
              <Link href='mailto:support@hatsprotocol.xyz' className='flex gap-2'>
                <FaExclamationCircle />
                Report this hat
              </Link>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <Modal name='make-hat-immutable' title={`Make Hat #${idToIp(selectedHat?.id)} Immutable`}>
        <div>
          <div>
            <p>Are you sure you want to make this hat immutable? This is not reversible.</p>
          </div>

          <div>
            <Button onClick={() => setModals?.({})}>Cancel</Button>

            <Button
              variant='destructive'
              className='mr-3'
              onClick={() => {
                updateImmutability?.();
                setModals?.({});
              }}
              disabled={isLoadingUpdateImmutability}
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export { MoreMenu };
