import { Stack } from '@chakra-ui/react';
import { useEnsAddress } from 'wagmi';

import AddressInput from '@/components/AddressInput';
import CONFIG, { MODULE_TYPES, ZERO_ADDRESS } from '@/constants';
import useDebounce from '@/hooks/useDebounce';
import useModuleUpdate from '@/hooks/useModuleUpdate';

const HatAdminsForm = ({
  chainId,
  hatData,
  localForm,
  eligibility,
  toggle,
}: {
  chainId: number;
  hatData: any;
  localForm: any;
  eligibility: string;
  toggle: string;
}) => {
  const isEligibilityChanged = eligibility !== hatData?.eligibility;
  const isToggleChanged = toggle !== hatData?.toggle;

  const {
    data: eligibilityResolvedAddress,
    isLoading: isLoadingEligibilityResolvedAddress,
  } = useEnsAddress({
    name: eligibility,
    chainId: 1,
  });

  const {
    data: toggleResolvedAddress,
    isLoading: isLoadingToggleResolvedAddress,
  } = useEnsAddress({
    name: toggle,
    chainId: 1,
  });

  const showEligibilityResolvedAddress =
    eligibilityResolvedAddress && eligibilityResolvedAddress !== eligibility;
  const showToggleResolvedAddress =
    toggleResolvedAddress && toggleResolvedAddress !== toggle;

  // changeHatEligibility
  const { writeAsync: writeAsyncEligibility, isLoading: isLoadingEligibility } =
    useModuleUpdate({
      hatsAddress: CONFIG.hatsAddress,
      chainId,
      hatId: hatData?.id,
      moduleType: MODULE_TYPES.eligibility,
      newAddress: eligibilityResolvedAddress ?? eligibility,
    });

  // changeHatToggle
  const { writeAsync: writeAsyncToggle, isLoading: isLoadingToggle } =
    useModuleUpdate({
      hatsAddress: CONFIG.hatsAddress,
      chainId,
      hatId: hatData?.id,
      moduleType: MODULE_TYPES.toggle,
      newAddress: toggleResolvedAddress ?? toggle,
    });

  const isEligibilityDisabled =
    !isEligibilityChanged ||
    isLoadingEligibility ||
    !writeAsyncEligibility ||
    isLoadingEligibilityResolvedAddress;
  const isToggleDisabled =
    !isToggleChanged ||
    isLoadingToggle ||
    !writeAsyncToggle ||
    isLoadingToggleResolvedAddress;

  return (
    <form>
      <Stack spacing={6}>
        <AddressInput
          name='eligibility'
          label='ELIGIBILITY'
          docsLink='https://docs.hatsprotocol.xyz/using-hats/setting-accountabilities/eligibility-requirements-for-wearers'
          localForm={localForm}
          showResolvedAddress={Boolean(showEligibilityResolvedAddress)}
          mutable={hatData?.mutable}
          resolvedAddress={String(eligibilityResolvedAddress)}
          isDisabled={isEligibilityDisabled}
          isLoading={
            isLoadingEligibility || isLoadingEligibilityResolvedAddress
          }
          writeAsync={writeAsyncEligibility}
        />

        <AddressInput
          name='toggle'
          label='TOGGLE'
          docsLink='https://docs.hatsprotocol.xyz/using-hats/setting-accountabilities/toggle-activating-and-deactivating-hats'
          localForm={localForm}
          showResolvedAddress={Boolean(showToggleResolvedAddress)}
          mutable={hatData?.mutable}
          resolvedAddress={String(toggleResolvedAddress)}
          isDisabled={isToggleDisabled}
          isLoading={isLoadingToggle || isLoadingToggleResolvedAddress}
          writeAsync={writeAsyncToggle}
        />
      </Stack>
    </form>
  );
};

export default HatAdminsForm;
