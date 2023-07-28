import { Stack } from '@chakra-ui/react';

import AddressInput from '@/components/AddressInput';
import { isTopHatOrMutable } from '@/lib/hats';

const HatRevocationForm = ({
  hatData,
  localForm,
  eligibility,
  eligibilityResolvedAddress,
}: {
  hatData: any;
  localForm: any;
  eligibility: string;
  eligibilityResolvedAddress?: `0x${string}` | null;
}) => {
  const showEligibilityResolvedAddress =
    eligibilityResolvedAddress && eligibilityResolvedAddress !== eligibility;

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
      </Stack>
    </form>
  );
};

export default HatRevocationForm;
