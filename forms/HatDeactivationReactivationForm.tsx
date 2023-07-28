import { Stack } from '@chakra-ui/react';

import AddressInput from '@/components/AddressInput';
import RadioBox from '@/components/atoms/RadioBox';
import { TRIGGER_OPTIONS } from '@/constants';
import { isTopHatOrMutable } from '@/lib/hats';

const HatDeactivationReactivationForm = ({
  hatData,
  localForm,
  toggle,
  toggleResolvedAddress,
}: {
  hatData: any;
  localForm: any;
  toggle: string;
  toggleResolvedAddress?: `0x${string}` | null;
}) => {
  const showToggleResolvedAddress =
    toggleResolvedAddress && toggleResolvedAddress !== toggle;

  const options = [
    { value: TRIGGER_OPTIONS.MANUALLY, label: TRIGGER_OPTIONS.MANUALLY },
    {
      value: TRIGGER_OPTIONS.AUTOMATICALLY,
      label: TRIGGER_OPTIONS.AUTOMATICALLY,
    },
  ];

  return (
    <form>
      <Stack spacing={6}>
        <RadioBox
          name='deactivation'
          label='Hat Deactivation'
          subLabel='How should hat deactivation and reactivation be handled?'
          localForm={localForm}
          options={options}
        />
        <AddressInput
          name='toggle'
          label='TOGGLE'
          docsLink='https://docs.hatsprotocol.xyz/using-hats/setting-accountabilities/toggle-activating-and-deactivating-hats'
          localForm={localForm}
          showResolvedAddress={Boolean(showToggleResolvedAddress)}
          isDisabled={!isTopHatOrMutable(hatData)}
          resolvedAddress={String(toggleResolvedAddress)}
        />
      </Stack>
    </form>
  );
};

export default HatDeactivationReactivationForm;
