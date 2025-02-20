'use client';

import { Modal, useOverlay, useSelectedHat } from 'contexts';
import { AddressInput, Form } from 'forms';
import { useWearersEligibilityStatus } from 'hats-hooks';
import { get, includes, pick, toLower } from 'lodash';
import { ReactNode, useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from 'ui';
import { formatAddress } from 'utils';
import { Hex, isAddress } from 'viem';
import { useEnsAddress } from 'wagmi';

export const CheckEligibilityForm = () => {
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;
  const { selectedHat, chainId } = useSelectedHat();
  const localForm = useForm();

  const [wearerDisplay, setWearerDisplay] = useState<ReactNode | undefined>();
  const { handleSubmit, watch, setValue } = localForm;

  const localWearer = watch('wearer');
  const localWearerIsAddress = isAddress(localWearer);

  const { data: resolvedAddress } = useEnsAddress({
    name: watch('wearer'),
    // enabled: includes(localWearer, '.eth'),
  });

  const wearerAddress = (toLower(resolvedAddress || undefined) || toLower(localWearer)) as Hex;
  const { data: wearersEligible } = useWearersEligibilityStatus({
    wearerIds: [wearerAddress],
    selectedHat,
    chainId,
  });
  const { eligibleWearers } = pick(wearersEligible, ['eligibleWearers']);
  const isEligible = includes(eligibleWearers, wearerAddress);

  const checkWearerEligibility = useCallback(
    async (data: object) => {
      const w = get(data, 'wearer-input');

      let eligibleStatus = <p className='text-destructive'>{w || formatAddress(resolvedAddress)} is not eligible</p>;
      if (isEligible) {
        eligibleStatus = <p className='text-green-500'>{w || formatAddress(resolvedAddress)} is eligible</p>;
      }
      setWearerDisplay(eligibleStatus);
    },
    [resolvedAddress, isEligible],
  );

  const closeModal = () => {
    setModals?.({});
    setValue('wearer', '', { shouldDirty: false });
    setWearerDisplay(undefined);
  };

  return (
    <Modal name='checkEligibility' title='Check Wearer Eligibility' onClose={closeModal} size='lg'>
      <div className='space-y-4'>
        <p className='text-sm'>Check the eligibility of a wearer for this hat based on the eligibility rule(s).</p>

        <Form {...localForm}>
          <form onSubmit={handleSubmit(checkWearerEligibility)} className='space-y-6'>
            <AddressInput name='wearer' label='Wearer' localForm={localForm} hideAddressButtons chainId={chainId} />

            <div className='flex justify-end'>
              <div className='flex items-center gap-4'>
                {wearerDisplay && wearerDisplay}

                <Button type='submit' disabled={!resolvedAddress && !localWearerIsAddress}>
                  Check Eligibility
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </Modal>
  );
};
