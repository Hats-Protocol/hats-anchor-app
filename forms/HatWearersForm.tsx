import { Box, Stack, Text } from '@chakra-ui/react';

import Input from '@/components/atoms/Input';
import RadioBox from '@/components/atoms/RadioBox';
import { MUTABILITY } from '@/constants';
import { isTopHatOrMutable } from '@/lib/hats';
import { IHat } from '@/types';

const MUTABILITY_OPTIONS = [
  { value: MUTABILITY.MUTABLE, label: 'Editable' },
  {
    value: MUTABILITY.IMMUTABLE,
    label: 'Not Editable (cannot be reversed)',
  },
];

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
          <Text fontSize='sm' fontWeight='medium' mb={2}>
            EDITABLE
          </Text>
          <RadioBox
            name='mutable'
            label='Should it be possible for an admin to make changes to this Hat?'
            localForm={localForm}
            options={MUTABILITY_OPTIONS}
            tooltip='Choose whether the Hat should be editable or not'
          />
          {localForm.watch('mutable') === MUTABILITY.IMMUTABLE && (
            <Text color='red.500' mt={3}>
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
