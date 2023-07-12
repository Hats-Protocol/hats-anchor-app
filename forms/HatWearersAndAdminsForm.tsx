import {
  Box,
  Button,
  FormControl,
  HStack,
  Radio,
  RadioGroup,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { FaCheck } from 'react-icons/fa';
import { useEnsAddress } from 'wagmi';

import Input from '@/components/Input';
import CONFIG, { MODULE_TYPES, MUTABILITY, ZERO_ADDRESS } from '@/constants';
import useDebounce from '@/hooks/useDebounce';
import useHatMakeImmutable from '@/hooks/useHatMakeImmutable';
import useHatSupplyUpdate from '@/hooks/useHatSupplyUpdate';
import useModuleUpdate from '@/hooks/useModuleUpdate';
import { isTopHat, prettyIdToIp } from '@/lib/hats';

const HatWearersAndAdminsForm = ({
  defaultAdmin,
  chainId,
  levelAtLocalTree,
  hatData,
}: {
  defaultAdmin: string | undefined;
  chainId: number;
  levelAtLocalTree: number;
  hatData: any;
}) => {
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
    useHatSupplyUpdate({
      hatsAddress: CONFIG.hatsAddress,
      chainId,
      hatId: hatData?.id,
      amount: maxSupply,
    });

  // changeHatEligibility
  const { writeAsync: writeAsyncEligibility, isLoading: isLoadingEligibility } =
    useModuleUpdate({
      hatsAddress: CONFIG.hatsAddress,
      chainId,
      hatId: hatData?.id,
      moduleType: MODULE_TYPES.eligibility,
      newAddress: eligibility,
    });

  // changeHatToggle
  const { writeAsync: writeAsyncToggle, isLoading: isLoadingToggle } =
    useModuleUpdate({
      hatsAddress: CONFIG.hatsAddress,
      chainId,
      hatId: hatData?.id,
      moduleType: MODULE_TYPES.toggle,
      newAddress: toggle,
    });

  // makeHatImmutable
  const { writeAsync: writeAsyncImmutable, isLoading: isLoadingImmutable } =
    useHatMakeImmutable({
      hatsAddress: CONFIG.hatsAddress,
      chainId,
      hatData,
      levelAtLocalTree,
    });

  const isMaxSupplyDisabled =
    !isMaxSupplyChanged || isLoadingMaxSupply || !writeAsyncMaxSupply;
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
        <Box>
          <Input
            name='maxSupply'
            label='MAX SUPPLY'
            placeholder='10'
            isDisabled={!mutable || isTopHat(hatData)}
            localForm={localForm}
          />
          <Button
            colorScheme='blue'
            isLoading={isLoadingMaxSupply}
            isDisabled={isMaxSupplyDisabled}
            onClick={() => writeAsyncMaxSupply?.()}
            mt={4}
          >
            Update Max Supply
          </Button>
        </Box>

        <Box>
          <Text fontWeight={500} mb={2}>
            MUTABILITY
          </Text>
          <RadioGroup
            name='mutable'
            defaultValue={
              hatData?.mutable ? MUTABILITY.MUTABLE : MUTABILITY.IMMUTABLE
            }
            onChange={(value) => setValue('mutable', value)}
            isDisabled={!hatData?.mutable}
          >
            <HStack spacing={4}>
              <Radio value={MUTABILITY.MUTABLE}>Mutable</Radio>
              <Radio value={MUTABILITY.IMMUTABLE}>Immutable</Radio>
            </HStack>
          </RadioGroup>
          <Button
            colorScheme='blue'
            isLoading={isLoadingImmutable}
            isDisabled={isMutableDisabled}
            onClick={() => writeAsyncImmutable?.()}
            mt={4}
          >
            Update Mutability
          </Button>
        </Box>
        <FormControl>
          <Box>
            <Input
              name='eligibility'
              label='ELIGIBILITY'
              info='https://docs.hatsprotocol.xyz/#eligibility'
              placeholder='Enter Wallet Address (0x…) or ENS (.eth)'
              rightElement={
                showEligibilityResolvedAddress && <FaCheck color='green' />
              }
              localForm={localForm}
              isDisabled={!hatData?.mutable}
            />
            {showEligibilityResolvedAddress && (
              <Text fontSize='sm' color='gray.500' mt={1}>
                Resolved address: {eligibilityResolvedAddress}
              </Text>
            )}
          </Box>
          <Button
            colorScheme='blue'
            isLoading={
              isLoadingEligibility || isLoadingEligibilityResolvedAddress
            }
            isDisabled={isEligibilityDisabled}
            onClick={() => writeAsyncEligibility?.()}
            mt={4}
          >
            Update Eligibility
          </Button>
        </FormControl>
        <FormControl>
          <Box>
            <Input
              name='toggle'
              label='TOGGLE'
              info='https://docs.hatsprotocol.xyz/#toggle'
              placeholder='Enter Wallet Address (0x…) or ENS (.eth)'
              rightElement={
                showToggleResolvedAddress && <FaCheck color='green' />
              }
              localForm={localForm}
              isDisabled={!hatData?.mutable}
            />
            {showToggleResolvedAddress && (
              <Text fontSize='sm' color='gray.500' mt={1}>
                Resolved address: {toggleResolvedAddress}
              </Text>
            )}
          </Box>
          <Button
            colorScheme='blue'
            isLoading={isLoadingToggle || isLoadingToggleResolvedAddress}
            isDisabled={isToggleDisabled}
            onClick={() => writeAsyncToggle?.()}
            mt={4}
          >
            Update Toggle
          </Button>
        </FormControl>
      </Stack>
    </form>
  );
};

export default HatWearersAndAdminsForm;
