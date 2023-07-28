import { Stack } from '@chakra-ui/react';

import AddressInput from '@/components/AddressInput';
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

  return (
    <form>
      <Stack spacing={6}>
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
