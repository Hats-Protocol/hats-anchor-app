'use client';

import { hatIdDecimalToIp, hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { useTreeForm } from 'contexts';
import { AddressInput, Input } from 'forms';
import { useAllWearers, useHatDetails, useProfileDetails } from 'hats-hooks';
import { concat, find, get, isEmpty, map, reject, size, subtract } from 'lodash';
import { useAllowlist } from 'modules-hooks';
import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AllowlistProfile, ModuleDetails } from 'types';
import { Button, Card } from 'ui';
import { formatAddress } from 'utils';
import { Hex } from 'viem';

import { AboutModule, EligibilityRow, ModuleHistory, ModuleModal } from '../../module-modal';

export const StakingModal = ({
  eligibilityHatId,
  moduleInfo,
}: {
  eligibilityHatId: Hex | undefined;
  moduleInfo: ModuleDetails;
}) => {
  const { chainId } = useTreeForm();
  const localForm = useForm();
  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateList, setUpdateList] = useState<AllowlistProfile[]>([]);
  // const { watch } = pick(localForm, ['watch']);

  const { data: hat, details } = useHatDetails({
    hatId: eligibilityHatId,
    chainId,
  });
  const { wearers } = useAllWearers({ selectedHat: hat || undefined, chainId });

  // const searchInput = watch('search');
  // const addresses = watch('addresses');
  const { data: allowlist } = useAllowlist({
    id: moduleInfo.instanceAddress,
    chainId,
  });
  const { data: profileDetails } = useProfileDetails({
    addresses: map(allowlist, (wearer) => get(wearer, 'id') as Hex), // TODO was 'address' ? works in allowlist
    chainId,
  });
  const allowlistProfiles = map(allowlist, (wearer: object) => {
    const profile = find(profileDetails, { id: get(wearer, 'address') });
    return {
      ...wearer,
      ...profile,
    };
    // TODO fix type
  }) as unknown as AllowlistProfile[];
  // const liveParams = get(moduleInfo, 'liveParameters');
  // const ownerHat = toString(
  //   get(find(liveParams, { label: 'Owner Hat' }), 'value'),
  // );
  // const judgeHat = toString(
  //   get(find(liveParams, { label: 'Arbitrator Hat' }), 'value'),
  // );

  const filteredProfiles = useMemo(() => {
    return allowlistProfiles;
  }, [allowlistProfiles]);

  const handleAdd = useCallback(
    (address: Hex) => {
      const profile = find(allowlistProfiles, { id: address });
      if (!profile) return;
      setUpdateList(concat(updateList, [profile]));
    },
    [updateList, allowlistProfiles],
  );

  const handleRemove = useCallback(
    (address: Hex) => {
      setUpdateList(reject(updateList, (p) => p.id === address));
    },
    [updateList],
  );

  return (
    <ModuleModal
      name={`${moduleInfo.instanceAddress}-stakingManager`}
      title='Manage Stakers'
      about={<AboutModule heading='About this Staking Module' moduleDescriptors={[]} />}
      history={<ModuleHistory />}
    >
      <h2 className='text-lg font-medium'>
        Staking for Hat {eligibilityHatId ? hatIdDecimalToIp(hatIdHexToDecimal(eligibilityHatId)) : ''} -{' '}
        {details?.name || hat?.details}
      </h2>

      <div className='flex'>
        <Input
          name='search'
          // className='min-w-[350px]'
          placeholder='Find by address (0x) or ENS (.eth)'
          localForm={localForm}
        />
      </div>

      <div className='pb-150px w-full space-y-4 overflow-y-auto pt-10'>
        <div className='space-y-1'>
          <div className='flex justify-between'>
            <p className='text-sm'>Address</p>
            <p className='text-sm'>Status</p>
          </div>

          <hr className='border-black' />
        </div>

        {map(filteredProfiles, (p: AllowlistProfile) => (
          <EligibilityRow
            key={p.id}
            eligibilityAccount={p}
            wearers={wearers}
            updating={updating}
            updateList={updateList}
            handleAdd={handleAdd}
            handleRemove={handleRemove}
          />
        ))}
      </div>

      <div className='min-h-100px bg-whiteAlpha-900 border-b-1 border-b-blackAlpha-200 absolute bottom-0 w-full rounded-b-md rounded-l-md py-4 md:py-10'>
        {!adding && !updating && (
          <div className='flex w-full items-center justify-center'>
            <div className='flex gap-2'>
              <Button variant='outline-blue' size='sm' onClick={() => setAdding(true)}>
                Add Address
              </Button>
              <Button variant='destructive' size='sm' onClick={() => setUpdating(true)}>
                Remove Address
              </Button>
            </div>
          </div>
        )}

        {adding && (
          <div className='w-full space-y-6 px-4 md:px-10'>
            <div className='space-y-1'>
              <h2 className='text-lg font-medium'>Add an address</h2>

              <AddressInput name='addresses' chainId={chainId} localForm={localForm} hideAddressButtons />
            </div>

            <div className='flex w-full justify-between'>
              <Button
                size='sm'
                variant='outline-blue'
                onClick={() => {
                  setUpdateList([]);
                  setAdding(false);
                }}
              >
                Cancel
              </Button>
              <Button size='sm'>Add</Button>
            </div>
          </div>
        )}

        {updating && (
          <div className='w-full space-y-6 px-4 md:px-10'>
            <div className='space-y-4'>
              <h2 className='text-lg font-medium'>Addresses selected for removal</h2>
              <Card>
                <div className='m-2 mx-4'>
                  {isEmpty(updateList) ? (
                    <p className='text-gray-500'>Select an address to remove</p>
                  ) : (
                    <p>
                      {map(
                        updateList,
                        (profile, index) =>
                          `${profile.ensName || formatAddress(profile.id)}${
                            index < subtract(size(updateList), 1) ? ', ' : ''
                          }`,
                      )}
                    </p>
                  )}
                </div>
              </Card>
            </div>

            <div className='flex w-full justify-between'>
              <Button
                variant='outline-blue'
                size='sm'
                onClick={() => {
                  setUpdateList([]);
                  setUpdating(false);
                }}
              >
                Cancel
              </Button>
              <Button variant='destructive' size='sm' disabled={isEmpty(updateList)}>
                Remove
              </Button>
            </div>
          </div>
        )}
      </div>
    </ModuleModal>
  );
};
