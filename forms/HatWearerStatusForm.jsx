import { useForm } from 'react-hook-form';
import _ from 'lodash';
import { utils } from 'ethers';
import { Stack, Button, Flex, Text } from '@chakra-ui/react';
import Input from '../components/Input';
import useDebounce from '../hooks/useDebounce';
import CONFIG, { hatsAddresses } from '../constants';
import RadioBox from '../components/RadioBox';
import useHatWearerStatusSet from '../hooks/useHatWearerStatusUpdate';

const HatWearerStatusForm = ({ hatData, chainId }) => {
  const localForm = useForm({ mode: 'onBlur' });
  const { handleSubmit, watch } = localForm;

  const wearer = useDebounce(watch('wearer', null), CONFIG.debounce);
  const eligibility = useDebounce(watch('eligibility', null), CONFIG.debounce);
  const standing = useDebounce(watch('standing', null), CONFIG.debounce);

  // TODO handle ens name

  const { writeAsync } = useHatWearerStatusSet({
    hatsAddress: hatsAddresses(chainId),
    hatId: _.get(hatData, 'prettyId'),
    wearer,
    eligibility,
    standing,
  });

  const onSubmit = async () => {
    await writeAsync?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <Text>
          Rule on a wearer&apos;s status. Selecting ineligible or bad standing
          will revoke their Hat. Standings are permanently recorded but can be
          changed later. Learn more in the docs.
        </Text>
        <Input
          localForm={localForm}
          name='wearer'
          label='Wearer Address'
          options={{
            validate: (value) =>
              utils.isAddress(value) ? true : 'Must be a valid address',
          }}
          placeholder='0x4a75000089d9B5C25d7876403C3B91997911FCd9'
        />
        <RadioBox
          localForm={localForm}
          name='eligibility'
          label='Eligibility'
          options={['Eligible', 'Ineligible']}
          isRequired
        />
        <RadioBox
          localForm={localForm}
          name='standing'
          label='Standing'
          options={['Good Standing', 'Bad Standing']}
          isRequired
        />

        <Flex justify='flex-end'>
          <Button type='submit' isDisabled={!wearer}>
            Update
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default HatWearerStatusForm;
