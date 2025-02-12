'use client';

import { Modal, useOverlay, useSelectedHat, useTreeForm } from 'contexts';
import { useAdminOfHats, useMulticallManyHats } from 'hats-hooks';
import { editHasUpdates } from 'hats-utils';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import posthog from 'posthog-js';
import { useMemo } from 'react';
import { BsChevronDoubleRight, BsXSquare } from 'react-icons/bs';
import { IoExitOutline } from 'react-icons/io5';
import { Button, Tooltip } from 'ui';
import { chainsMap } from 'utils';
import { Hex } from 'viem';
import { useAccount, useChainId } from 'wagmi';

const NetworkSwitcher = dynamic(() => import('molecules').then((mod) => mod.NetworkSwitcher));

const TopMenu = () => {
  const currentChain = useChainId();
  const { address } = useAccount();
  const { handlePendingTx, setModals } = useOverlay();
  const {
    chainId,
    treeId,
    editMode,
    setEditMode,
    storedData,
    resetTree,
    treeToDisplay,
    onchainHats,
    setStoredData,
    setSelectedOption,
    onCloseTreeDrawer,
  } = useTreeForm();
  const { selectedHat } = useSelectedHat();

  const hatIds = _.filter(_.map(storedData, 'id'), (hatId: Hex) => hatId !== undefined) as Hex[];

  const { adminHatIds } = useAdminOfHats({ hatIds, chainId });

  const isAdminOfAnyHatWithChanges = useMemo(() => {
    const hatsWithChangesIds = _.map(storedData, 'id');

    const hasAdminOverAnyHat = _.some(hatsWithChangesIds, (id: Hex) => _.includes(adminHatIds, id));

    return hasAdminOverAnyHat;
  }, [storedData, adminHatIds]);

  const { writeAsync } = useMulticallManyHats({
    isAdminOfAnyHatWithChanges,
    storedData,
    setStoredData,
    treeToDisplay,
    onchainHats,
    chainId,
    handlePendingTx,
    editMode,
    setEditMode,
    onCloseTreeDrawer,
  });

  const handleDeploy = async () => {
    await writeAsync?.();
    // TODO handle result and close drawer
    // if (result) {
    //   setEditMode?.(false);
    //   onCloseTreeDrawer?.();
    // }
  };

  const promptForReset = () => {
    if (editHasUpdates(storedData)) {
      setModals?.({ 'reset-changes': true });
    } else {
      setEditMode?.(!editMode);
      onCloseTreeDrawer?.();
      setSelectedOption?.('wearers');
    }
  };

  const confirmReset = () => {
    posthog.capture('Reset Tree Changes', {
      tree_id: treeId,
      chain_id: chainId,
    });
    resetTree?.();
    setModals?.({});
  };

  const getDeployTooltipLabel = useMemo(() => {
    if (!storedData?.length) {
      return 'No changes have been made.';
    }
    if (!address) {
      return 'Connect a wallet to deploy. Or export the changes to a file.';
    }
    if (chainId !== currentChain) {
      return `Must be on ${chainsMap(chainId).name} to deploy`;
    }
    if (!isAdminOfAnyHatWithChanges) {
      return 'You must be the admin of at least one hat with changes to deploy';
    }
    return '';
  }, [chainId, currentChain, address, isAdminOfAnyHatWithChanges, storedData]);

  const isDeployDisabled = useMemo(
    () => !editHasUpdates(storedData) || currentChain !== chainId || !isAdminOfAnyHatWithChanges,
    [storedData, currentChain, chainId, isAdminOfAnyHatWithChanges],
  );

  return (
    <div className='top-0 z-[16] flex w-full items-center justify-between border-b border-gray-200 bg-white/90 px-4 py-4'>
      <div className='flex items-center justify-between gap-2'>
        <Button variant='outline' onClick={promptForReset}>
          <BsXSquare className='mr-2' />
          Cancel
        </Button>
        {chainId === selectedHat?.chainId ? (
          <Button variant='outline' onClick={onCloseTreeDrawer}>
            <BsChevronDoubleRight className='mr-2' />
            Close
          </Button>
        ) : (
          <Tooltip label='Close'>
            <Button variant='outline' onClick={onCloseTreeDrawer} aria-label='Close'>
              <BsChevronDoubleRight />
            </Button>
          </Tooltip>
        )}
      </div>
      <div className='flex items-center justify-between gap-2'>
        <NetworkSwitcher />
        <Tooltip label={isDeployDisabled ? getDeployTooltipLabel : ''}>
          <Button className='bg-functional-link-primary' disabled={isDeployDisabled} onClick={handleDeploy}>
            <IoExitOutline className='mr-2' />
            Deploy
          </Button>
        </Tooltip>
      </div>

      <Modal name='reset-changes' title='Reset Changes' size='md'>
        <div className='space-y-6'>
          <p>Are you sure you want to reset all current changes?</p>

          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setModals?.({})}>
              Cancel
            </Button>
            <Button className='bg-destructive' onClick={confirmReset}>
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export { TopMenu };
