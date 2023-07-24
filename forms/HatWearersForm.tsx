import { Stack } from '@chakra-ui/react';
import { useChainId } from 'wagmi';

import Input from '@/components/atoms/Input';
import MaxSupplyInput from '@/components/MaxSupplyInput';
import MutabilityInput from '@/components/MutabilityInput';
import CONFIG from '@/constants';
import useHatContractWrite from '@/hooks/useHatContractWrite';
import useHatMakeImmutable from '@/hooks/useHatMakeImmutable';
import {
  decimalId,
  idToPrettyId,
  isTopHatOrMutable,
  prettyIdToIp,
  toTreeId,
} from '@/lib/hats';
import { IHat } from '@/types';

const HatWearersForm = ({
  defaultAdmin,
  chainId,
  levelAtLocalTree,
  hatData,
  isAdminUser,
  localForm,
  maxSupply,
  mutable,
}: {
  defaultAdmin: string | undefined;
  chainId: number;
  levelAtLocalTree: number;
  hatData: IHat;
  isAdminUser: boolean;
  localForm: any;
  maxSupply: string;
  mutable: boolean;
}) => {
  const currentNetworkId = useChainId();
  const { setValue } = localForm;
  const decimalAdmin = prettyIdToIp(defaultAdmin);
  const isMaxSupplyChanged = maxSupply !== hatData?.maxSupply;
  const isMutableChanged = hatData?.mutable && !mutable;

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
