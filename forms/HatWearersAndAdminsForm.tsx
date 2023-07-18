import { Stack } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useChainId, useEnsAddress } from 'wagmi';

import Input from '@/components/atoms/Input';
import AddressInput from '@/components/HatWearersAndAdminsFormComponents/AddressInput';
import MaxSupplyInput from '@/components/HatWearersAndAdminsFormComponents/MaxSupplyInput';
import MutabilityInput from '@/components/HatWearersAndAdminsFormComponents/MutabilityInput';
import CONFIG, { MODULE_TYPES, MUTABILITY, ZERO_ADDRESS } from '@/constants';
import useDebounce from '@/hooks/useDebounce';
import useHatContractWrite from '@/hooks/useHatContractWrite';
import useHatMakeImmutable from '@/hooks/useHatMakeImmutable';
import useModuleUpdate from '@/hooks/useModuleUpdate';
import {
  decimalId,
  idToPrettyId,
  isTopHatOrMutable,
  prettyIdToIp,
  toTreeId,
} from '@/lib/hats';

const HatWearersAndAdminsForm = ({
  defaultAdmin,
  chainId,
  levelAtLocalTree,
  hatData,
  isAdminUser,
}: {
  defaultAdmin: string | undefined;
  chainId: number;
  levelAtLocalTree: number;
  hatData: any;
  isAdminUser: boolean;
}) => {
  const currentNetworkId = useChainId();
  const localForm = useForm({
    mode: 'onChange',
    defaultValues: {
      maxSupply: hatData?.maxSupply,
      eligibility: hatData?.eligibility,
      toggle: hatData?.toggle,
      mutable: hatData?.mutable ? MUTABILITY.MUTABLE : MUTABILITY.IMMUTABLE,
    },
  });
  const { watch, setValue } = localForm;

  const maxSupply = useDebounce(watch('maxSupply', hatData?.maxSupply));
  const eligibility = useDebounce(
    watch('eligibility', hatData?.eligibility || ZERO_ADDRESS),
  );
  const toggle = useDebounce(watch('toggle', hatData?.toggle || ZERO_ADDRESS));
  const mutable = useDebounce(watch('mutable', hatData?.mutable));

  const decimalAdmin = prettyIdToIp(defaultAdmin);

  const isMaxSupplyChanged = maxSupply !== hatData?.maxSupply;
  const isMutableChanged = hatData?.mutable && mutable === MUTABILITY.IMMUTABLE;
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

  // changeHatMaxSupply
  const { writeAsync: writeAsyncMaxSupply, isLoading: isLoadingMaxSupply } =
    useHatContractWrite({
      functionName: 'changeHatMaxSupply',
      args: [decimalId(hatData?.id), maxSupply],
      chainId,
      onSuccessToastData: {
        title: 'Max Supply updated!',
        description: `Successfully updated the max supply of hat #${prettyIdToIp(
          idToPrettyId(hatData?.id),
        )}`,
      },
      queryKeys: [
        ['hatDetails', hatData?.id],
        ['treeDetails', toTreeId(hatData?.id)],
      ],
      enabled:
        Boolean(hatData?.id) &&
        Boolean(maxSupply) &&
        isAdminUser &&
        chainId === currentNetworkId,
    });

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

  // makeHatImmutable
  const { writeAsync: writeAsyncImmutable, isLoading: isLoadingImmutable } =
    useHatMakeImmutable({
      hatsAddress: CONFIG.hatsAddress,
      chainId,
      hatId: hatData.id,
      levelAtLocalTree,
      isAdminUser,
      mutable,
    });

  const isMaxSupplyDisabled =
    !isMaxSupplyChanged ||
    isLoadingMaxSupply ||
    !writeAsyncMaxSupply ||
    !mutable;
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

  const isMutableDisabled =
    !isMutableChanged || isLoadingImmutable || !writeAsyncImmutable;

  return (
    <form>
      <Stack spacing={6}>
        <Input
          localForm={localForm}
          name='admin'
          label='Admin of Hat'
          defaultValue={decimalAdmin}
          isDisabled
        />
        <MaxSupplyInput
          isTopHatOrMutable={isTopHatOrMutable(hatData)}
          localForm={localForm}
          isMaxSupplyDisabled={isMaxSupplyDisabled}
          isLoadingMaxSupply={isLoadingMaxSupply}
        />

        <MutabilityInput
          mutable={hatData?.mutable}
          isLoadingImmutable={isLoadingImmutable}
          writeAsyncImmutable={writeAsyncImmutable}
          onChange={(value) => setValue('mutable', value)}
          isMutableDisabled={isMutableDisabled}
        />

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

export default HatWearersAndAdminsForm;
