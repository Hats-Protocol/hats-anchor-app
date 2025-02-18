import { ModuleParameter } from '@hatsprotocol/modules-sdk';
import { hatIdDecimalToHex } from '@hatsprotocol/sdk-v1-core';
import { useOverlay, useTreeForm } from 'contexts';
import { useWearerDetails } from 'hats-hooks';
import { useWaitForSubgraph } from 'hooks';
import { find, get, map, pick, some } from 'lodash';
import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { AllowlistProfile, HatWearer, ModuleDetails } from 'types';
import { Hex, TransactionReceipt } from 'viem';
import { useAccount, useWriteContract } from 'wagmi';

import { ManageBar } from '../../module-modal';
import { AddForm } from './add-form';
import { RemoveForm } from './remove-form';

const AllowlistForms = ({
  localForm,
  setUpdateList,
  setUpdating,
  adding,
  setAdding,
  updateList,
  updating,
  moduleInfo,
  moduleParameters,
}: AllowlistFormsProps) => {
  const { address } = useAccount();
  const { handlePendingTx } = useOverlay();
  const { chainId } = useTreeForm();
  const { writeContractAsync } = useWriteContract();
  const waitForSubgraph = useWaitForSubgraph({ chainId });
  const [isLoading, setIsLoading] = useState(false);
  const { watch } = pick(localForm, ['setValue', 'watch']);
  const addressesToAdd = watch('addresses');

  const { abi, id: moduleId } = pick(moduleInfo, ['abi', 'id']);

  const ownerHat = get(find(moduleParameters, { label: 'Owner Hat' }), 'value');
  const judgeHat = get(find(moduleParameters, { label: 'Arbitrator Hat' }), 'value');
  const { data: wearerHats } = useWearerDetails({
    wearerAddress: address as Hex,
    chainId,
  });

  const isOwner =
    !!ownerHat &&
    some(wearerHats, {
      id: hatIdDecimalToHex(ownerHat as bigint),
    });
  const isJudge =
    !!judgeHat &&
    some(wearerHats, {
      id: hatIdDecimalToHex(judgeHat as bigint),
    });

  const onRemoveSuccess = (data: TransactionReceipt | undefined) => {
    setUpdateList([]);
    setUpdating(false);
    setIsLoading(false);
  };

  const handleRemoveWearers = useCallback(async () => {
    setIsLoading(true);
    const removeAddresses = map(updateList, (p) => p.id);
    return writeContractAsync({
      address: moduleId,
      abi: abi,
      functionName: 'removeAccounts',
      args: [removeAddresses],
    })
      .then((tx) => {
        handlePendingTx?.({
          hash: tx,
          txChainId: chainId,
          txDescription: 'Removed Wearers',
          waitForSubgraph,
          onSuccess: onRemoveSuccess,
        });
      })
      .catch((error) => {
        console.error('Error removing wearers', error);
        // TODO toasts
        setIsLoading(false);
      });
  }, [
    setUpdateList,
    chainId,
    abi,
    moduleId,
    updateList,
    // handlePendingTx,
    // writeContractAsync,
    setUpdating,
  ]);

  const onSetStandingSuccess = (data: TransactionReceipt | undefined) => {
    setUpdateList([]);
    setUpdating(false);
    setIsLoading(false);
  };

  const handleSetWearersStanding = useCallback(async () => {
    if (!moduleInfo.instanceAddress) return;
    setIsLoading(true);
    const standings = map(updateList, () => false); // standing = false
    const addresses = map(updateList, (account) => get(account, 'id'));
    const tx = await writeContractAsync({
      address: moduleInfo.instanceAddress,
      abi: moduleInfo.abi,
      functionName: 'setStandingForAccounts',
      args: [addresses, standings],
    });
    handlePendingTx?.({
      hash: tx,
      txChainId: chainId,
      txDescription: 'Set Wearers Standing',
      waitForSubgraph,
      onSuccess: onSetStandingSuccess,
    });
  }, [
    setUpdateList,
    chainId,
    updateList,
    moduleInfo.abi,
    moduleInfo.instanceAddress,
    // writeContractAsync,
    setUpdating,
  ]);

  const onAddSuccess = (data: TransactionReceipt | undefined) => {
    setUpdateList([]);
    setAdding(false);
    setIsLoading(false);
  };

  const handleAddWearers = useCallback(async () => {
    if (!moduleInfo.instanceAddress) return;
    setIsLoading(true);
    // TODO catch error
    const addresses = map(addressesToAdd, (account) => get(account, 'address'));
    return writeContractAsync({
      address: moduleInfo.instanceAddress,
      abi: moduleInfo.abi,
      functionName: 'addAccounts',
      args: [addresses],
    })
      .then(async (tx) => {
        console.log('tx', tx);
        handlePendingTx?.({
          hash: tx,
          txChainId: chainId,
          txDescription: 'Added Wearers to Allowlist', // TODO for Hat Id
          waitForSubgraph,
          onSuccess: onAddSuccess,
        });
      })
      .catch((error) => {
        console.error('Error adding wearers', error);
        // TODO catch decline
        setIsLoading(false);
      });
  }, [
    addressesToAdd,
    setAdding,
    chainId,
    // writeContractAsync,
    // setValue,
    moduleInfo.abi,
    moduleInfo.instanceAddress,
  ]);

  return (
    <ManageBar
      sections={[
        {
          label: 'Add Addresses',
          value: adding,
          hasRole: isOwner,
          section: (
            <AddForm
              localForm={localForm}
              setUpdateList={setUpdateList as Dispatch<SetStateAction<HatWearer[]>>}
              setAdding={setAdding}
              handleAddWearers={handleAddWearers}
              isLoading={isLoading}
            />
          ),
        },
        {
          label: 'Remove Addresses',
          value: updating,
          hasRole: isJudge,
          section: (
            <RemoveForm
              updateList={updateList}
              setUpdateList={setUpdateList}
              setUpdating={setUpdating}
              handleRemoveWearers={handleRemoveWearers}
              isLoading={isLoading}
            />
          ),
        },
        {
          label: 'Remove Addresses',
          value: updating,
          hasRole: isJudge,
          section: (
            <RemoveForm
              updateList={updateList}
              setUpdateList={setUpdateList}
              setUpdating={setUpdating}
              handleRemoveWearers={handleSetWearersStanding}
              isLoading={isLoading}
            />
          ),
        },
      ]}
      buttons={[
        { label: 'Add Address', onClick: () => setAdding(true) },
        {
          label: 'Remove Address',
          onClick: () => setUpdating(true),
          colorScheme: 'red.500',
        },
      ]}
    />
  );
};

interface AllowlistFormsProps {
  localForm: UseFormReturn<any>;
  setUpdateList: Dispatch<SetStateAction<AllowlistProfile[]>>;
  setUpdating: Dispatch<SetStateAction<boolean>>;
  adding: boolean;
  setAdding: Dispatch<SetStateAction<boolean>>;
  updateList: AllowlistProfile[];
  updating: boolean;
  moduleInfo: ModuleDetails;
  moduleParameters: ModuleParameter[];
}

export { AllowlistForms };
