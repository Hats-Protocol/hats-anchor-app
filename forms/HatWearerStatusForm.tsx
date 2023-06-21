import {
  Stack,
  Button,
  Flex,
  Text,
  RadioGroup,
  Radio,
  HStack,
  VStack,
} from '@chakra-ui/react';
import _ from 'lodash';
import { useForm } from 'react-hook-form';

import CONFIG from '@/constants';
import useDebounce from '@/hooks/useDebounce';
import useHatWearerStatusSet from '@/hooks/useHatWearerStatusUpdate';
import { FaRegQuestionCircle, FaRegUserCircle } from 'react-icons/fa';
import { formatAddress } from '@/lib/general';
import { prettyIdToId } from '@/lib/hats';

const HatWearerStatusForm = ({
  hatData,
  chainId,
  wearer,
  eligibility,
}: {
  hatData: any;
  chainId: number;
  wearer: string;
  eligibility: string;
}) => {
  const localForm = useForm({ mode: 'onBlur' });
  const { handleSubmit, watch, setValue } = localForm;

  const standing = useDebounce(watch('standing', 'Good Standing'));

  const { writeAsync, isLoading } = useHatWearerStatusSet({
    hatsAddress: CONFIG.hatsAddress,
    hatId: prettyIdToId(_.get(hatData, 'prettyId')),
    chainId,
    wearer,
    eligibility: eligibility === 'Eligible',
    standing: standing === 'Good Standing',
  });

  const onSubmit = async () => {
    await writeAsync?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={8}>
        <Text>
          Are you sure? The revoked Hats will loose all permissions instantly.
        </Text>

        <VStack alignItems='start'>
          <Text fontSize='sm'>REVOKING HAT OF:</Text>
          <HStack>
            <FaRegUserCircle />
            <Text>{formatAddress(wearer)}</Text>
          </HStack>
        </VStack>

        <VStack alignItems='start'>
          <HStack>
            <Text>WEARER STANDING</Text>
            <FaRegQuestionCircle />
          </HStack>
          <Text color='gray.600'>
            Changes of wearer standing are being recorded on chain. To change it
            back to good you will have to submit a smart contract transaction.
          </Text>
        </VStack>

        <RadioGroup
          name='standing'
          defaultValue='Good Standing'
          onChange={(value) => setValue('standing', value)}
        >
          <HStack spacing={4}>
            <Radio value='Good Standing'>Good Standing</Radio>
            <Radio value='Bad Standing'>Bad Standing</Radio>
          </HStack>
        </RadioGroup>

        <Flex justify='flex-end' gap='3'>
          <Button>Cancel</Button>
          <Button
            type='submit'
            isDisabled={!wearer || isLoading || !writeAsync}
            colorScheme={standing === 'Good Standing' ? 'blue' : 'red'}
          >
            Revoke Hat Token in {standing}
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default HatWearerStatusForm;
