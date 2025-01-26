'use client';

import { hatIdDecimalToIp, hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { useTreeForm } from 'contexts';
import { AddressInput, Input } from 'forms';
import { useAllWearers, useHatDetails, useProfileDetails } from 'hats-hooks';
import {
  concat,
  find,
  isEmpty,
  map,
  // pick,
  reject,
  size,
  subtract,
  // toString,
} from 'lodash';
import { useAllowlist } from 'modules-hooks';
import { useCallback, useMemo, useState } from 'react';
import { get, useForm } from 'react-hook-form';
import { AllowlistProfile, ModuleDetails } from 'types';
import { Button, Card } from 'ui';
import { formatAddress } from 'utils';
import { Hex } from 'viem';

import { AboutModule, EligibilityRow, ModuleHistory, ModuleModal } from '../../module-modal';

export const ElectionModal = ({
  eligibilityHatId,
  moduleInfo,
}: {
  eligibilityHatId: Hex | undefined;
  moduleInfo: ModuleDetails;
}) => {
  const { chainId } = useTreeForm();
  const localForm = useForm();
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [removeList, setRemoveList] = useState<AllowlistProfile[]>([]);
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
      setRemoveList(concat(removeList, [profile]));
    },
    [removeList, allowlistProfiles],
  );

  const handleRemove = useCallback(
    (address: Hex) => {
      setRemoveList(reject(removeList, (p) => p.id === address));
    },
    [removeList],
  );

  return (
    <ModuleModal
      name='electionManager'
      title='Manage Election'
      about={<AboutModule heading='About this Election' moduleDescriptors={[]} />}
      history={<ModuleHistory />}
    >
      <h3 className='text-md font-bold'>
        Election for Hat {eligibilityHatId ? hatIdDecimalToIp(hatIdHexToDecimal(eligibilityHatId)) : ''} -{' '}
        {details?.name || hat?.details}
      </h3>

      <div className='flex'>
        <Input name='search' placeholder='Find by address (0x) or ENS (.eth)' localForm={localForm} />
      </div>

      <div className='pb-150px w-full space-y-4 overflow-y-auto pt-10'>
        <div className='space-y-1'>
          <div className='flex justify-between'>
            <p className='text-sm'>Address</p>
            <p className='text-sm'>Status</p>
          </div>

          <hr className='border-b border-black' />
        </div>

        {map(filteredProfiles, (p: AllowlistProfile) => (
          <EligibilityRow
            key={p.id}
            eligibilityAccount={p}
            wearers={wearers}
            updating={removing}
            updateList={removeList}
            handleAdd={handleAdd}
            handleRemove={handleRemove}
          />
        ))}
      </div>

      <div className='min-h-100px bg-whiteAlpha-900 border-b-blackAlpha-200 absolute bottom-0 w-full rounded-b-md rounded-l-md border-b-2 py-4 md:py-10'>
        {!adding && !removing && (
          <div className='flex w-full items-center justify-center'>
            <div className='flex gap-2'>
              <Button variant='outline-blue' size='sm' onClick={() => setAdding(true)}>
                Add Address
              </Button>

              <Button variant='destructive' size='sm' onClick={() => setRemoving(true)}>
                Remove Address
              </Button>
            </div>
          </div>
        )}

        {adding && (
          <div className='w-full px-4 md:px-10'>
            <div className='space-y-1'>
              <h3 className='text-md'>Add an address</h3>

              <AddressInput name='addresses' chainId={chainId} localForm={localForm} hideAddressButtons />
            </div>

            <div className='flex w-full justify-between'>
              <Button
                size='sm'
                variant='outline-blue'
                onClick={() => {
                  setRemoveList([]);
                  setAdding(false);
                }}
              >
                Cancel
              </Button>

              <Button size='sm'>Add</Button>
            </div>
          </div>
        )}

        {removing && (
          <div className='w-full px-4 md:px-10'>
            <div className='space-y-1'>
              <h3 className='text-md'>Addresses selected for removal</h3>

              <Card>
                <div className='m-2 mx-4'>
                  {isEmpty(removeList) ? (
                    <p className='text-gray-500'>Select an address to remove</p>
                  ) : (
                    <p>
                      {map(
                        removeList,
                        (profile, index) =>
                          `${profile.ensName || formatAddress(profile.id)}${
                            index < subtract(size(removeList), 1) ? ', ' : ''
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
                  setRemoveList([]);
                  setRemoving(false);
                }}
              >
                Cancel
              </Button>

              <Button size='sm' disabled={isEmpty(removeList)}>
                Remove
              </Button>
            </div>
          </div>
        )}
      </div>
    </ModuleModal>
  );
};
