import { Box, HStack, Radio, RadioGroup, Stack, Text } from '@chakra-ui/react';
import { Controller } from 'react-hook-form';

import Input from '@/components/atoms/Input';
import { MUTABILITY } from '@/constants';
import { isTopHatOrMutable } from '@/lib/hats';
import { IHat } from '@/types';

const HatWearersForm = ({
  hatData,
  localForm,
}: {
  hatData: IHat;
  localForm: any;
}) => {
  return (
    <form>
      <Stack spacing={6} mb={2}>
        <Input
          name='maxSupply'
          label='MAX WEARERS'
          placeholder='10'
          isDisabled={!isTopHatOrMutable(hatData)}
          localForm={localForm}
        />

        <Box>
          <Text fontSize='sm' fontWeight='medium'>
            EDITABLE
          </Text>
          <Text mb={4} color='blackAlpha.700'>
            Should it be possible for an admin to make changes to this Hat?
          </Text>
          <Controller
            control={localForm.control}
            name='mutable'
            render={({ field }) => (
              // eslint-disable-next-line react/jsx-props-no-spreading
              <RadioGroup {...field} isDisabled={!isTopHatOrMutable(hatData)}>
                <HStack spacing={4}>
                  <Radio value={MUTABILITY.MUTABLE}>
                    <Text fontSize='sm'>Editable</Text>
                  </Radio>
                  <Radio value={MUTABILITY.IMMUTABLE}>
                    <Text fontSize='sm'>Not Editable (cannot be reversed)</Text>
                  </Radio>
                </HStack>
              </RadioGroup>
            )}
          />
          {localForm.watch('mutable') === MUTABILITY.IMMUTABLE && (
            <Text color='red.500' mt={4}>
              Beware: This will make the Hat immutable. No one can ever change
              it. This can not be undone.
            </Text>
          )}
        </Box>
      </Stack>
    </form>
  );
};

export default HatWearersForm;
