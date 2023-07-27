import { Stack } from '@chakra-ui/react';

import AddressInput from '@/components/AddressInput';
import { isTopHatOrMutable } from '@/lib/hats';

const HatAdminsForm = ({
  hatData,
  localForm,
  eligibility,
  toggle,
  eligibilityResolvedAddress,
  toggleResolvedAddress,
}: {
  hatData: any;
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
          isDisabled={!isTopHatOrMutable(hatData)}
          resolvedAddress={String(eligibilityResolvedAddress)}
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

export default HatAdminsForm;
