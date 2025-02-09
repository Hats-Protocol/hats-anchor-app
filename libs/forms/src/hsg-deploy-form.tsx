'use client';

import { useOverlay, useTreeForm } from 'contexts';
import { first, get } from 'lodash';
import { useHsgDeploy } from 'modules-hooks';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { BaseCheckbox, Button } from 'ui';
import { chainsMap } from 'utils';

import { AddressInput, DynamicThreshold, Form, MultiHatsSelect, NumberInput, RadioBox } from './components';

// TODO handle loading state

const SAFE_ATTACH_OPTIONS = [
  { label: 'Deploy a new Safe', value: 'deploy' },
  { label: 'Connect an existing Safe', value: 'connect' },
];

const HsgDeployForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { chainId, treeToDisplay } = useTreeForm();
  const { setModals, handlePendingTx } = useOverlay();

  const localForm = useForm();
  const {
    watch,
    setValue,
    reset,
    handleSubmit,
    formState: { isValid, errors },
  } = localForm;
  const defaultMaxSigners = watch('defaultMaxSigners');

  const afterSuccess = () => {
    setIsLoading(false);

    // TODO invalidate queries
    onClose();
  };

  const onError = () => {
    setIsLoading(false);
  };

  const { deployHsg } = useHsgDeploy({
    chainId,
    localForm,
    handlePendingTx,
    afterSuccess,
    onError,
  });

  useEffect(() => {
    const defaultValues = {
      safe: get(first(SAFE_ATTACH_OPTIONS), 'value'),
      defaultMaxSigners: true,
      minThreshold: 2,
      targetThreshold: 6, // equivalent to maxThreshold, match contract in code
      maxSigners: 12,
      useDynamicThreshold: false,
    };

    reset(defaultValues, { keepDefaultValues: false });
  }, []);

  const onClose = () => {
    reset();
    setModals?.({});
  };

  const onSubmit = (data: any) => {
    setIsLoading(true);
    console.log(data);
    deployHsg();
  };

  // TODO check if safeAddress is valid
  // TODO ownerHatId is required
  // TODO at least one signersHatId is required

  const chainName = chainsMap(chainId)?.name;
  const isDisabled = !isValid;

  return (
    <Form {...localForm}>
      <form className='space-y-10' onSubmit={handleSubmit(onSubmit)}>
        <div className='space-y-4'>
          <RadioBox name='safe' options={SAFE_ATTACH_OPTIONS} localForm={localForm} />

          {watch('safe') === 'connect' && (
            <AddressInput
              name='safeAddress'
              label={`${chainName} Safe address`}
              subLabel={`Existing ${chainName} Safe address to connect to this Hat`}
              chainId={chainId}
              localForm={localForm}
              hideAddressButtons
            />
          )}
        </div>

        <MultiHatsSelect
          name='owner'
          label='Safe Owner Hat'
          subLabel='All Wearers of the selected Hat can change these settings in the future'
          placeholder='Choose owner Hat'
          localForm={localForm}
          hatOptions={treeToDisplay}
        />

        <MultiHatsSelect
          name='signers'
          label='Hats that can claim Signer'
          subLabel='All Wearers of the selected Hats can claim signer rights'
          placeholder='Choose signer Hats'
          localForm={localForm}
          hatOptions={treeToDisplay}
          allowMultiple
        />

        <DynamicThreshold localForm={localForm} />

        <div className='space-y-4'>
          <div className='space-y-2'>
            <div className='flex items-center'>
              <p className='text-sm font-normal uppercase'>Maximum amount of signers</p>

              <p className='text-xs text-red-500'>Immutable</p>
            </div>

            <p className='text-sm text-gray-600'>
              When not set, the maximum number of signers on the Safe will be the sum of max wearers for all signer
              hats.
            </p>
          </div>

          <BaseCheckbox
            checked={!defaultMaxSigners}
            onChange={(e) => setValue('defaultMaxSigners', !defaultMaxSigners)}
          >
            Limit the amount of signers on this multisig
          </BaseCheckbox>

          {!defaultMaxSigners && (
            <NumberInput
              name='maxSigners'
              subLabel='The maximum amount of signers that can become signer on the attached Safe'
              localForm={localForm}
            />
          )}
        </div>

        <div className='flex justify-end'>
          <div className='flex gap-2'>
            <Button variant='outline' onClick={onClose}>
              Cancel
            </Button>

            <Button type='submit' disabled={isDisabled}>
              Create
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export { HsgDeployForm };
