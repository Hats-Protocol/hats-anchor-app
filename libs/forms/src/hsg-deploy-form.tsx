import { Button, Checkbox, Flex, Heading, HStack, Stack, Text } from '@chakra-ui/react';
import { useOverlay, useTreeForm } from 'contexts';
import { first, get } from 'lodash';
import { useHsgDeploy } from 'modules-hooks';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { chainsMap } from 'utils';

import { AddressInput, DynamicThreshold, MultiHatsSelect, NumberInput, RadioBox } from './components';

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
    <Stack as='form' spacing={10} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
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
      </Stack>

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

      <Stack>
        <Stack>
          <HStack align='center'>
            <Heading size='sm' textTransform='uppercase' fontWeight='normal'>
              Maximum amount of signers
            </Heading>
            <Text size='xs' color='red.500'>
              Immutable
            </Text>
          </HStack>
          <Text size='sm' color='gray.600'>
            When not set, the maximum number of signers on the Safe will be the sum of max wearers for all signer hats.
          </Text>
        </Stack>

        <Checkbox isChecked={!defaultMaxSigners} onChange={(e) => setValue('defaultMaxSigners', !e.target.checked)}>
          Limit the amount of signers on this multisig
        </Checkbox>

        {!defaultMaxSigners && (
          <NumberInput
            name='maxSigners'
            subLabel='The maximum amount of signers that can become signer on the attached Safe'
            localForm={localForm}
          />
        )}
      </Stack>

      <Flex justify='flex-end'>
        <HStack>
          <Button variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button variant='primary' type='submit' isLoading={isLoading} isDisabled={isDisabled}>
            Create
          </Button>
        </HStack>
      </Flex>
    </Stack>
  );
};

export { HsgDeployForm };
