import { Stack } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useChainId } from 'wagmi';

import Input from '@/components/atoms/Input';
import MaxSupplyInput from '@/components/MaxSupplyInput';
import MutabilityInput from '@/components/MutabilityInput';
import CONFIG, { MUTABILITY } from '@/constants';
import useDebounce from '@/hooks/useDebounce';
import useHatContractWrite from '@/hooks/useHatContractWrite';
import useHatMakeImmutable from '@/hooks/useHatMakeImmutable';
import {
  decimalId,
  idToPrettyId,
  isTopHatOrMutable,
  prettyIdToIp,
  toTreeId,
} from '@/lib/hats';

const HatWearersForm = ({
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
  const mutable = useDebounce(watch('mutable', hatData?.mutable));

  const decimalAdmin = prettyIdToIp(defaultAdmin);

  const isMaxSupplyChanged = maxSupply !== hatData?.maxSupply;
  const isMutableChanged = hatData?.mutable && mutable === MUTABILITY.IMMUTABLE;

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

  const isMutableDisabled =
    !isMutableChanged || isLoadingImmutable || !writeAsyncImmutable;

  return (
    <form>
      <Stack spacing={6} mb={2}>
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
      </Stack>
    </form>
  );
};

export default HatWearersForm;
