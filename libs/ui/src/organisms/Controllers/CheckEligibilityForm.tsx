import { Button, Flex, HStack, Stack, Text } from '@chakra-ui/react';
import { Modal, useOverlay, useSelectedHat } from 'contexts';
import { useWearerEligibilityCheck } from 'hats-hooks';
import _ from 'lodash';
import { ReactNode, useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { formatAddress } from 'utils';
import { isAddress } from 'viem';
import { useEnsAddress } from 'wagmi';

import { AddressInput } from '../../forms';

const CheckEligibilityForm = () => {
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
    enabled: _.includes(localWearer, '.eth'),
  });

  const { data: wearerEligible } = useWearerEligibilityCheck({
    wearer: resolvedAddress || localWearer,
    selectedHat,
    chainId,
  });

  const checkWearerEligibility = useCallback(
    async (data: object) => {
      const w = _.get(data, 'wearer-input');

      let eligibleStatus = (
        <Text color='red.500' size={{ base: 'sm', md: 'md' }}>
          {w || formatAddress(resolvedAddress)} is not eligible
        </Text>
      );
      if (wearerEligible) {
        eligibleStatus = (
          <Text color='green.500' size={{ base: 'sm', md: 'md' }}>
            {w || formatAddress(resolvedAddress)} is eligible
          </Text>
        );
      }
      setWearerDisplay(eligibleStatus);
    },
    [resolvedAddress, wearerEligible],
  );

  const closeModal = () => {
    setModals?.({});
    setValue('wearer', '', { shouldDirty: false });
    setWearerDisplay(undefined);
  };

  return (
    <Modal
      name='checkEligibility'
      title='Check Wearer Eligibility'
      localOverlay={localOverlay}
      onClose={closeModal}
    >
      <Stack spacing={4}>
        <Text fontSize='sm'>
          Check the eligibility of a wearer for this hat based on the
          eligibility rule(s).
        </Text>

        <Stack
          as='form'
          onSubmit={handleSubmit(checkWearerEligibility)}
          spacing={6}
        >
          <AddressInput
            name='wearer'
            label='Wearer'
            localForm={localForm}
            hideAddressButtons
            chainId={chainId}
          />

          <Flex justify='end'>
            <HStack spacing={4}>
              {wearerDisplay && wearerDisplay}

              <Button
                type='submit'
                colorScheme='blue'
                isDisabled={!resolvedAddress && !localWearerIsAddress}
              >
                Check Eligibility
              </Button>
            </HStack>
          </Flex>
        </Stack>
      </Stack>
    </Modal>
  );
};

export default CheckEligibilityForm;
