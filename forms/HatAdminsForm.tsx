import { Stack } from '@chakra-ui/react';

import AddressInput from '@/components/AddressInput';

const HatAdminsForm = ({
  mutable,
  localForm,
  eligibility,
  toggle,
  eligibilityResolvedAddress,
  toggleResolvedAddress,
}: {
  mutable?: boolean;
  localForm: any;
  eligibility: string;
  toggle: string;
  eligibilityResolvedAddress?: `0x${string}` | null;
  toggleResolvedAddress?: `0x${string}` | null;
}) => {
  const showEligibilityResolvedAddress =
    eligibilityResolvedAddress && eligibilityResolvedAddress !== eligibility;
  const showToggleResolvedAddress =
    toggleResolvedAddress && toggleResolvedAddress !== toggle;

  return (
    <form>
      <Stack spacing={6}>
        <AddressInput
          name='eligibility'
          label='ELIGIBILITY'
          docsLink='https://docs.hatsprotocol.xyz/using-hats/setting-accountabilities/eligibility-requirements-for-wearers'
          localForm={localForm}
          showResolvedAddress={Boolean(showEligibilityResolvedAddress)}
          mutable={mutable}
          resolvedAddress={String(eligibilityResolvedAddress)}
        />

        <AddressInput
          name='toggle'
          label='TOGGLE'
          docsLink='https://docs.hatsprotocol.xyz/using-hats/setting-accountabilities/toggle-activating-and-deactivating-hats'
          localForm={localForm}
          showResolvedAddress={Boolean(showToggleResolvedAddress)}
          mutable={mutable}
          resolvedAddress={String(toggleResolvedAddress)}
        />
      </Stack>
    </form>
  );
};

export default HatAdminsForm;
