'use client';

import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useSelectedHat, useTreeForm } from 'contexts';
import { FormRowWrapper, RadioBox } from 'forms';
import { Select } from 'forms';
import { useHatDetails, useHatDetailsField, useIsAdmin } from 'hats-hooks';
import { includes, map, pick } from 'lodash';
import { useMultiClaimsHatterCheck } from 'modules-hooks';
import { UseFormReturn } from 'react-hook-form';
import { BsBarChartLine, BsInfoCircle, BsPersonAdd, BsPersonCheck, BsPuzzle } from 'react-icons/bs';
import { idToIp } from 'shared';
import { AppHat } from 'types';
import { Link } from 'ui';
import { formatAddress } from 'utils';
import { Hex } from 'viem';

const PermissionlessClaimingForm = ({ localForm, parentHats }: { localForm: UseFormReturn; parentHats?: AppHat[] }) => {
  const { onchainHats, treeToDisplay, chainId, storedData, editMode } = useTreeForm();
  const { selectedHat } = useSelectedHat();

  const { watch } = pick(localForm, ['watch']);
  const adminHat = watch('adminHat');
  const isPermissionlesslyClaimable = watch('isPermissionlesslyClaimable');

  const { multiClaimsHatter, instanceAddress, claimableHats } = useMultiClaimsHatterCheck({
    chainId,
    selectedHatId: selectedHat?.id,
    onchainHats,
    storedData,
    editMode,
  });
  console.log('multiClaimsHatter', multiClaimsHatter, instanceAddress, claimableHats);

  const isAdmin = useIsAdmin({
    address: instanceAddress,
    hatId: selectedHat?.id,
    chainId,
  });

  const isClaimable = includes(claimableHats, selectedHat?.id);
  const { data: wearingHatDetails } = useHatDetails({
    hatId: String(adminHat),
    chainId: selectedHat?.chainId,
    editMode,
  });
  const { data: wearingHatDetailsObject } = useHatDetailsField(wearingHatDetails?.details, editMode);

  const adminHatOptions = map(parentHats, (h: AppHat) => ({
    label: `${idToIp(h.id as Hex)} - ${h.detailsObject?.data?.name}`,
    value: h.id,
  }));

  if (!onchainHats || !treeToDisplay) return null;

  if (isClaimable) {
    return (
      <div className='mx-8 mt-4 flex flex-col gap-12'>
        <div className='flex items-center gap-2'>
          <p>This hat is already claimable via </p>
          <Link href={`/wearers/${instanceAddress}`} isExternal>
            <pre>{formatAddress(instanceAddress)}</pre>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='mx-8 mt-6 flex flex-col gap-12'>
      <FormRowWrapper noMargin>
        <BsPersonAdd className='absolute -ml-8 size-4' />

        <div className='flex flex-col'>
          <RadioBox
            name='isPermissionlesslyClaimable'
            label='Hat Claiming'
            helperText='Should this hat be permissionlessly claimable by potential wearers who meet the requirements of the accountability module?'
            localForm={localForm}
            options={[
              {
                label: 'Yes',
                value: 'Yes',
              },
              {
                label: 'No — admin mint only',
                value: 'No',
              },
            ]}
            isDisabled={!parentHats?.length}
          />
        </div>
      </FormRowWrapper>
      {!(parentHats && parentHats.length > 0) && (
        <FormRowWrapper noMargin>
          <BsInfoCircle className='absolute -ml-8 mt-1 size-4' />

          <p className='text-functional-text-secondary'>
            Permissionless claiming is currently unavailable as there are no eligible hats present. To enable this
            option, there must be at least one non-top hat admin of this hat available.
          </p>
        </FormRowWrapper>
      )}

      {isPermissionlesslyClaimable === 'Yes' && (
        <div className='flex flex-col gap-12'>
          {multiClaimsHatter && !isClaimable && isAdmin && isPermissionlesslyClaimable === 'Yes' ? (
            <FormRowWrapper noMargin>
              <BsInfoCircle className='absolute -ml-8 mt-1 size-4' />

              <p className='text-cyan-600'>
                A claims hatter for this tree has already been set up at{' '}
                <pre className='inline'>{formatAddress(instanceAddress)}</pre>. We&apos;ll register this hat with the
                hatter during the module deploy transaction.
              </p>
            </FormRowWrapper>
          ) : (
            <FormRowWrapper noMargin>
              <BsPuzzle className='absolute -ml-8 mt-1 size-4' />

              <div className='flex flex-col gap-1'>
                <Select
                  name='adminHat'
                  label='ADMIN HAT'
                  subLabel='To enable permissionless claiming, give an admin hat in this tree to the new hatter contract. Must be a non-top hat admin of this hat.'
                  localForm={localForm}
                  placeholder='Select a hat in this tree'
                  options={adminHatOptions}
                />

                {selectedHat && (
                  <p className='text-sm text-gray-500'>
                    Potential wearers will be able to claim this hat (#
                    {hatIdDecimalToIp(BigInt(selectedHat.id))}) if they meet the requirements in new module above.
                  </p>
                )}
              </div>
            </FormRowWrapper>
          )}
          <FormRowWrapper noMargin>
            <BsPersonCheck className='absolute -ml-8 mt-1 size-4' />
            <div className='flex flex-col'>
              <RadioBox
                name='initialClaimabilityType'
                label='CLAIM FOR ACCOUNT'
                helperText='Should this hat be claimable on behalf of an account?'
                localForm={localForm}
                options={[
                  {
                    label: 'Yes',
                    value: '2',
                  },
                  {
                    label: 'No',
                    value: '1',
                  },
                ]}
              />
            </div>
          </FormRowWrapper>
        </div>
      )}

      {wearingHatDetails?.wearers?.length === Number(wearingHatDetails?.maxSupply) && !instanceAddress && (
        <FormRowWrapper noMargin>
          <BsBarChartLine className='mt-2 h-4 w-4' />
          <div className='flex flex-col'>
            <RadioBox
              name='incrementWearers'
              label='Increment Max Wearers by 1'
              helperText={`The admin hat you selected (${hatIdDecimalToIp(BigInt(wearingHatDetails?.id))} — ${
                wearingHatDetailsObject?.data.name
              }) has no more available supply to mint. Do you want to increase the max wearers by 1 in order to mint this hat to the new hatter contract?`}
              localForm={localForm}
              options={[
                {
                  label: `Yes — increase max wearers from ${
                    wearingHatDetails?.maxSupply
                  } to ${Number(wearingHatDetails?.maxSupply) + 1}`,
                  value: 'Yes',
                },
                {
                  label: 'No (cancel deployment)',
                  value: 'No',
                },
              ]}
            />
          </div>
        </FormRowWrapper>
      )}
    </div>
  );
};

export { PermissionlessClaimingForm };
