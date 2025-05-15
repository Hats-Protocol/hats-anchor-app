'use client';

import { MULTI_CLAIMS_HATTER_V1_ABI } from '@hatsprotocol/constants';
import { hatIdDecimalToIp, hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { useOverlay, useSelectedHat, useTreeForm } from 'contexts';
import { usePendHatterMint, useWaitForSubgraph } from 'hooks';
import { find, first, get, includes, map, pick } from 'lodash';
import { useMultiClaimsHatterCheck } from 'modules-hooks';
import { ReactNode, useEffect, useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { BsFileCode, BsPersonAdd } from 'react-icons/bs';
import { idToIp } from 'shared';
import { AppHat } from 'types';
import { Button, Tooltip } from 'ui';
import { formatAddress } from 'utils';
import { logger } from 'utils';
import { Hex } from 'viem/_types/types/misc';
import { useWriteContract } from 'wagmi';

import { FormRowWrapper, Select } from './components';

const ClaimsHandlerWrapper = ({ children }: { children: ReactNode }) => (
  <FormRowWrapper noMargin>
    <BsPersonAdd className='absolute -ml-8 mt-1 size-4' />
    <div className='flex flex-col'>
      <div className='flex items-center'>
        <p className='text-sm uppercase'>Hat Claiming</p>
      </div>

      {children}
    </div>
  </FormRowWrapper>
);

const ClaimsHandler = ({ localForm, onOpenModuleDrawer, setIsStandAloneHatterDeploy }: ClaimsHandlerProps) => {
  const { treeToDisplay, chainId, storedData, onchainHats, editMode, setStoredData } = useTreeForm();
  const { selectedHat } = useSelectedHat();
  const { writeContractAsync } = useWriteContract();
  const {
    instanceAddress,
    hatterIsAdmin,
    wearingHat: wearingHatId,
    claimableHats,
  } = useMultiClaimsHatterCheck({
    chainId,
    selectedHatId: selectedHat?.id as Hex | undefined,
    storedData,
    onchainHats,
    editMode,
  });
  const { watch, setValue } = pick(localForm, ['watch', 'setValue']);
  const { handlePendingTx } = useOverlay();
  const waitForSubgraph = useWaitForSubgraph({ chainId });

  const hatToMintTo = watch('hatToMintTo');
  const { availableAdmins, hatToMintPended, pendMintHatForHatter } = usePendHatterMint({
    address: instanceAddress as Hex,
    hatToMintTo: hatToMintTo?.value,
    treeToDisplay,
    selectedHat,
    storedData,
    setStoredData,
  });
  const wearingHat = useMemo(() => {
    if (!wearingHatId) return undefined;
    return find(treeToDisplay, { id: wearingHatId });
  }, [treeToDisplay, wearingHatId]);

  // TODO handle current hat names (while editing)
  const hatToMintToOptions = map(availableAdmins, (a: AppHat) => ({
    label: `${idToIp(a.id as Hex)} ${get(a, 'detailsObject.data.name', get(a, 'details'))}`,
    value: a.id,
  }));

  const onSuccess = () => {
    // TODO handle success (invalidate queries)
    logger.info('success');
  };

  const registerHat = () => {
    if (!instanceAddress || !selectedHat?.id) {
      logger.error('no instance address or selected hat id', {
        instanceAddress,
        selectedHat,
      });
      return;
    }

    return writeContractAsync({
      functionName: 'setHatClaimability',
      address: instanceAddress,
      abi: MULTI_CLAIMS_HATTER_V1_ABI,
      args: [hatIdHexToDecimal(selectedHat?.id), 1],
      chainId,
    })
      .then((hash) => {
        handlePendingTx?.({
          hash,
          txChainId: chainId,
          txDescription: 'Register Hat',
          waitForSubgraph,
          onSuccess,
        });
      })
      .catch((error) => {
        logger.error('Error registering hat', error);
      });
  };

  useEffect(() => {
    if (treeToDisplay && hatToMintPended) {
      const localHatToMintTo = get(first(availableAdmins), 'id');
      setValue('hatToMintTo', hatToMintPended || localHatToMintTo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!includes(claimableHats, selectedHat?.id) && hatterIsAdmin) {
    return (
      <ClaimsHandlerWrapper>
        <div className='mt-1'>
          <p className='text-sm font-light'>There is a claims hatter in the tree, but this hat is not set claimable.</p>
          <div>
            <Button variant='outline' onClick={registerHat}>
              Make Claimable
            </Button>
          </div>
        </div>
      </ClaimsHandlerWrapper>
    );
  }

  if (hatterIsAdmin) {
    return (
      <ClaimsHandlerWrapper>
        <div className='mt-1 space-y-2'>
          <p className='text-sm text-gray-500'>
            This hat has a claims hatter contract deployed, and permissionless claiming is enabled. Potential wearers
            will be able to claim this hat if they meet the requirements in this hat&quot;s accountability module.
          </p>
          {wearingHat && instanceAddress && (
            <p className='text-cyan-600'>
              Claims hatter contract (<span className='font-mono'>{formatAddress(instanceAddress)}</span>) is wearing
              Hat {hatIdDecimalToIp(BigInt(wearingHat?.id))} ({get(wearingHat, 'detailsObject.data.name')})
            </p>
          )}
        </div>
      </ClaimsHandlerWrapper>
    );
  }

  if (!hatterIsAdmin && instanceAddress) {
    return (
      <ClaimsHandlerWrapper>
        <div className='mt-1 flex flex-col gap-2'>
          <p>
            A claims hatter exists at <span className='font-mono'>{formatAddress(instanceAddress)}</span>, but it is not
            an admin of this hat.
          </p>
          <Select
            localForm={localForm}
            name='hatToMintTo'
            options={hatToMintToOptions}
            isDisabled={!!hatToMintPended}
          />

          {(hatToMintTo || hatToMintPended) && (
            <div className='flex justify-end'>
              <Tooltip
                label={
                  hatToMintPended &&
                  `Mint pended for hatter on hat #${hatIdDecimalToIp(BigInt(hatToMintPended || get(hatToMintTo, 'value')))}`
                }
              >
                <Button
                  size='xs'
                  variant='outline-blue'
                  disabled={!hatToMintTo || !!hatToMintPended}
                  onClick={pendMintHatForHatter}
                >
                  Mint {hatIdDecimalToIp(BigInt(hatToMintPended || get(hatToMintTo, 'value')))} to{' '}
                  {formatAddress(instanceAddress)}
                </Button>
              </Tooltip>
            </div>
          )}
        </div>
      </ClaimsHandlerWrapper>
    );
  }

  return (
    <ClaimsHandlerWrapper>
      <p className='text-sm text-gray-500'>
        To enable permissionless claiming of this hat, deploy a claims hatter contract and give that contract an admin
        hat in this tree.
      </p>
      <div>
        <Button
          variant='outline'
          className='text-normal'
          onClick={() => {
            onOpenModuleDrawer();
            setIsStandAloneHatterDeploy(true);
          }}
        >
          <BsFileCode /> Deploy Claims Hatter
        </Button>
      </div>
    </ClaimsHandlerWrapper>
  );
};

interface ClaimsHandlerProps {
  localForm: UseFormReturn;
  onOpenModuleDrawer: () => void;
  setIsStandAloneHatterDeploy: (value: boolean) => void;
}

export { ClaimsHandler, type ClaimsHandlerProps };
