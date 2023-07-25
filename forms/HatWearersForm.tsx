import { HStack, Radio, RadioGroup, Stack, Text } from '@chakra-ui/react';

import Input from '@/components/atoms/Input';
import { MUTABILITY } from '@/constants';
import { isTopHatOrMutable, prettyIdToIp } from '@/lib/hats';
import { IHat } from '@/types';

const HatWearersForm = ({
  defaultAdmin,
  hatData,
  localForm,
  mutable,
}: {
  defaultAdmin: string | undefined;
  hatData: IHat;
  localForm: any;
  mutable: boolean;
}) => {
  const { setValue } = localForm;
  const decimalAdmin = prettyIdToIp(defaultAdmin);

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

        <Input
          name='maxSupply'
          label='MAX SUPPLY'
          placeholder='10'
          isDisabled={!isTopHatOrMutable(hatData)}
          localForm={localForm}
        />

        <Text fontWeight={500} mb={2}>
          MUTABILITY
        </Text>
        <RadioGroup
          name='mutable'
          defaultValue={mutable ? MUTABILITY.MUTABLE : MUTABILITY.IMMUTABLE}
          onChange={(value) => setValue('mutable', value)}
          isDisabled={!mutable}
        >
          <HStack spacing={4}>
            <Radio value={MUTABILITY.MUTABLE}>Mutable</Radio>
            <Radio value={MUTABILITY.IMMUTABLE}>Immutable</Radio>
          </HStack>
        </RadioGroup>
      </Stack>
    </form>
  );
};

export default HatWearersForm;
