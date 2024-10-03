'use client';

import {
  hatIdDecimalToHex,
  hatIdDecimalToIp,
  hatIdHexToDecimal,
} from '@hatsprotocol/sdk-v1-core';
import { useTreeForm } from 'contexts';
import { useAllWearers, useHatDetails, useProfileDetails } from 'hats-hooks';
import {
  compact,
  concat,
  find,
  map,
  pick,
  reject,
  some,
  toLower,
  toString,
} from 'lodash';
import { useAllowlist } from 'modules-hooks';
import { useCallback, useMemo, useState } from 'react';
import { get, useForm } from 'react-hook-form';
import { AllowlistProfile, ModuleDetails } from 'types';
import { Hex } from 'viem';
import { useAccount, useWriteContract } from 'wagmi';

import {
  AboutModule,
  FILTER,
  Filter,
  ManageBar,
  ModuleHistory,
  ModuleModal,
  ProfileList,
} from '../../module-modal';
import { AddForm } from './add-form';
import { RemoveForm } from './remove-form';

export const AllowlistModal = ({
  eligibilityHatId,
  moduleInfo,
}: {
  eligibilityHatId: Hex | undefined;
  moduleInfo: ModuleDetails;
}) => {
  const { chainId } = useTreeForm();
  const localForm = useForm();
  const { address } = useAccount();
  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateList, setUpdateList] = useState<AllowlistProfile[]>([]);
  const [activeFilter, setActiveFilter] = useState<Filter>(FILTER.WEARER);
  const { setValue, watch } = pick(localForm, ['setValue', 'watch']);
  const { writeContractAsync } = useWriteContract();

  const { data: hat, details } = useHatDetails({
    hatId: eligibilityHatId,
    chainId,
  });

  const addressesToAdd = watch('addresses');
  console.log('addressesToAdd', addressesToAdd);
  const { data: allowlist } = useAllowlist({
    id: moduleInfo.id,
    chainId,
  });
  const { data: profileDetails } = useProfileDetails({
    addresses: map(allowlist, (wearer) => get(wearer, 'address')),
    chainId,
  });
  const allowlistProfiles = map(allowlist, (wearer: object) => {
    const profile = find(profileDetails, { id: get(wearer, 'address') });
    return {
      ...wearer,
      ...profile,
    };
  }) as AllowlistProfile[];
  const liveParams = get(moduleInfo, 'liveParameters');
  const ownerHat = toString(
    get(find(liveParams, { label: 'Owner Hat' }), 'value'),
  );
  const judgeHat = toString(
    get(find(liveParams, { label: 'Arbitrator Hat' }), 'value'),
  );
  const { data: ownerHatDetails } = useHatDetails({
    hatId: hatIdDecimalToHex(BigInt(ownerHat)),
    chainId,
  });
  const { data: judgeHatDetails } = useHatDetails({
    hatId: hatIdDecimalToHex(BigInt(judgeHat)),
    chainId,
  });
  const { wearers: ownerHatWearers } = useAllWearers({
    selectedHat: ownerHatDetails || undefined,
    chainId,
  });
  const { wearers: judgeHatWearers } = useAllWearers({
    selectedHat: judgeHatDetails || undefined,
    chainId,
  });
  const isOwner = some(ownerHatWearers, { id: toLower(address) });
  const isJudge = some(judgeHatWearers, { id: toLower(address) });

  const handleUpdateListAdd = useCallback(
    (address: Hex) => {
      const profile = find(allowlistProfiles, { id: address });
      if (!profile) return;
      setUpdateList(concat(updateList, [profile]));
    },
    [updateList, allowlistProfiles],
  );

  const handleUpdateListRemove = useCallback(
    (address: Hex) => {
      setUpdateList(reject(updateList, (p) => p.id === address));
    },
    [updateList],
  );

  const handleRemoveWearers = useCallback(async () => {
    const removeAddresses = map(updateList, (p) => p.id);
    const tx = await writeContractAsync({
      address: moduleInfo.id,
      abi: moduleInfo.abi,
      functionName: 'removeAccounts',
      args: [removeAddresses],
    });
    console.log('tx', tx);
    setUpdateList([]);
    setUpdating(false);
  }, [
    setUpdateList,
    moduleInfo.abi,
    moduleInfo.id,
    updateList,
    // writeContractAsync,
    setUpdating,
  ]);

  const handleAddWearers = useCallback(async () => {
    const addresses = map(addressesToAdd, (account) => get(account, 'address'));
    const tx = await writeContractAsync({
      address: moduleInfo.id,
      abi: moduleInfo.abi,
      functionName: 'addAccounts',
      args: [addresses],
    });
    console.log('tx', tx);
    setValue('addresses', []);
    setAdding(false);
  }, [
    addressesToAdd,
    setAdding,
    // writeContractAsync,
    // setValue,
    moduleInfo.abi,
    moduleInfo.id,
  ]);

  const handleClose = useCallback(() => {
    setActiveFilter(FILTER.WEARER);
    setUpdateList([]);
    setAdding(false);
    setUpdating(false);
    setValue('addresses', []);
    setValue('search', undefined);
  }, [setValue]);

  const moduleDescriptors = useMemo(() => {
    return compact([
      eligibilityHatId && {
        label: 'Eligibility Rule for this Hat',
        hatId: eligibilityHatId,
      },
      {
        label: 'Owner edits the allowlist',
        hatId: ownerHat as Hex,
      },
      {
        label: 'Judge determines wearer standing',
        hatId: judgeHat as Hex,
      },
    ]);
  }, [ownerHat, judgeHat, eligibilityHatId]);

  if (!hat || !eligibilityHatId) return null;

  const heading = `Allowlist for Hat 
        ${hatIdDecimalToIp(hatIdHexToDecimal(eligibilityHatId))} - 
        ${details?.name || hat?.details}`;

  return (
    <ModuleModal
      name='allowlistManager'
      title='Manage Allowlist'
      about={
        <AboutModule
          heading='About this Allowlist'
          moduleDescriptors={moduleDescriptors}
        />
      }
      history={<ModuleHistory />}
      onClose={handleClose}
    >
      <ProfileList
        hat={hat}
        heading={heading}
        profiles={allowlistProfiles}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        localForm={localForm}
        handleUpdateListAdd={handleUpdateListAdd}
        handleUpdateListRemove={handleUpdateListRemove}
        updating={updating}
        updateList={updateList}
      />

      {/* TODO: must be wearer of owner hat to add/remove */}
      <ManageBar
        sections={[
          {
            label: 'Add Addresses',
            value: adding,
            hasRole: isOwner,
            section: (
              <AddForm
                localForm={localForm}
                setUpdateList={setUpdateList}
                setValue={setValue}
                setAdding={setAdding}
                handleAddWearers={handleAddWearers}
              />
            ),
          },
          {
            label: 'Remove Addresses',
            value: updating,
            hasRole: isOwner,
            section: (
              <RemoveForm
                updateList={updateList}
                setUpdateList={setUpdateList}
                setUpdating={setUpdating}
                handleRemoveWearers={handleRemoveWearers}
              />
            ),
          },
          {
            label: 'Remove Addresses',
            value: updating,
            hasRole: isOwner,
            section: (
              <RemoveForm
                updateList={updateList}
                setUpdateList={setUpdateList}
                setUpdating={setUpdating}
                handleRemoveWearers={handleRemoveWearers}
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
    </ModuleModal>
  );
};
