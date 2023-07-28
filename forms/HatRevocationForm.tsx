import { Stack } from '@chakra-ui/react';

import AddressInput from '@/components/AddressInput';
import RadioBox from '@/components/atoms/RadioBox';
import { TRIGGER_OPTIONS } from '@/constants';
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
          name='revocation'
          label='Hat Revocation'
          subLabel='How should revocation from wearers be handled?'
          localForm={localForm}
          options={options}
        />
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
