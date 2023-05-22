import { useForm } from 'react-hook-form';
import _ from 'lodash';
import { isAddress } from 'viem';
import { Stack, Button, Flex, Text, Heading } from '@chakra-ui/react';
import Input from '../components/Input';
import useDebounce from '../hooks/useDebounce';
import CONFIG from '../constants';
import RadioBox from '../components/RadioBox';
import useHatWearerStatusSet from '../hooks/useHatWearerStatusUpdate';
import { prettyIdToIp } from '../lib/hats';

const HatWearerStatusForm = ({ hatData, chainId, defaultValues }) => {
  const localForm = useForm({ mode: 'onBlur' });
  const { handleSubmit, watch } = localForm;

  const wearer = useDebounce(watch('wearer', null), CONFIG.debounce);
  const eligibility = useDebounce(watch('eligibility', null), CONFIG.debounce);
  const standing = useDebounce(watch('standing', null), CONFIG.debounce);

  const { writeAsync, ensError, isLoading } = useHatWearerStatusSet({
    hatsAddress: CONFIG.hatsAddress,
    hatId: _.get(hatData, 'prettyId'),
    chainId,
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

        <Stack>
          <Text>Hat ID</Text>
          <Heading size='md'>
            {prettyIdToIp(_.get(hatData, 'prettyId'))}
          </Heading>
        </Stack>
        <Input
          localForm={localForm}
          name='wearer'
          label='Wearer Address'
          options={{
            validate: (value) =>
              isAddress(value) ? true : 'Must be a valid address',
          }}
          placeholder='0x4a75000089d9B5C25d7876403C3B91997911FCd9'
          defaultValue={_.get(defaultValues, 'wearer')}
        />
        <RadioBox
          localForm={localForm}
          name='eligibility'
          label='Eligibility'
          options={['Eligible', 'Ineligible']}
          defaultValue={_.get(defaultValues, 'eligibility')}
          isRequired
        />
        <RadioBox
          localForm={localForm}
          name='standing'
          label='Standing'
          options={['Good Standing', 'Bad Standing']}
          defaultValue={_.get(defaultValues, 'standing')}
          isRequired
        />

        <Flex justify='flex-end'>
          <Button type='submit' isDisabled={!wearer || ensError || isLoading}>
            Update
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default HatWearerStatusForm;
