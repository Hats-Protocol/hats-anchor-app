import { useForm } from 'react-hook-form';
import _ from 'lodash';
import { Stack, Button, Flex, Text, Heading, Box } from '@chakra-ui/react';
import Input from '@/components/Input';
import useDebounce from '@/hooks/useDebounce';
import CONFIG from '@/constants';
import RadioBox from '@/components/RadioBox';
import useHatWearerStatusSet from '@/hooks/useHatWearerStatusUpdate';
import { prettyIdToIp } from '@/lib/hats';

const HatWearerStatusForm = ({ hatData, chainId, defaultValues }) => {
  const localForm = useForm({ mode: 'onBlur' });
  const { handleSubmit, watch } = localForm;

  const wearer = useDebounce(watch('wearer', null), CONFIG.debounce);
  const eligibility = useDebounce(watch('eligibility', null), CONFIG.debounce);
  const standing = useDebounce(watch('standing', null), CONFIG.debounce);

  const { writeAsync, isLoading, wearerResolvedAddress } =
    useHatWearerStatusSet({
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

  const showWearerResolvedAddress =
    wearerResolvedAddress && wearer !== wearerResolvedAddress;

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
        <Box>
          <Input
            localForm={localForm}
            name='wearer'
            label='Wearer Address'
            placeholder='0x1234, vitalik.eth'
            defaultValue={_.get(defaultValues, 'wearer')}
          />

          {showWearerResolvedAddress && (
            <Text fontSize='sm' color='gray.500' mt={1}>
              Resolved address: {wearerResolvedAddress}
            </Text>
          )}
        </Box>
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
          <Button type='submit' isDisabled={!wearer || isLoading}>
            Update
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default HatWearerStatusForm;
