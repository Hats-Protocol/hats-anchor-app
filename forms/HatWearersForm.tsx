import { HStack, Radio, RadioGroup, Stack, Text } from '@chakra-ui/react';
import { Controller } from 'react-hook-form';

import Input from '@/components/atoms/Input';
import { MUTABILITY } from '@/constants';
import { isTopHatOrMutable, prettyIdToIp } from '@/lib/hats';
import { IHat } from '@/types';

const HatWearersForm = ({
  defaultAdmin,
  hatData,
  localForm,
}: {
  defaultAdmin: string | undefined;
  hatData: IHat;
  localForm: any;
}) => {
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
        <Controller
          control={localForm.control}
          name='mutable'
          render={({ field }) => (
            // eslint-disable-next-line react/jsx-props-no-spreading
            <RadioGroup {...field} isDisabled={!isTopHatOrMutable(hatData)}>
              <HStack spacing={4}>
                <Radio value={MUTABILITY.MUTABLE}>Mutable</Radio>
                <Radio value={MUTABILITY.IMMUTABLE}>Immutable</Radio>
              </HStack>
            </RadioGroup>
          )}
        />
      </Stack>
    </form>
  );
};

export default HatWearersForm;
