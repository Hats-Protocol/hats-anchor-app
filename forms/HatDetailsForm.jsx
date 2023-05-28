import { useState } from 'react';
import _ from 'lodash';
import {
  Stack,
  Flex,
  Button,
  Spinner,
  FormControl,
  Switch,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import Input from '../components/Input';

import Textarea from '../components/Textarea';
import useHatDetailsUpdate from '../hooks/useHatDetailsUpdate';
import CONFIG from '../constants';
import useDebounce from '../hooks/useDebounce';
import { pinJson } from '../lib/ipfs';
import useCid from '../hooks/useCid';
import { prettyIdToIp } from '../lib/hats';

const HatDetailsForm = ({ hatData, chainId }) => {
  const [customDetails, setCustomDetails] = useState(true);
  const localForm = useForm({ mode: 'onChange' });
  const { handleSubmit, watch } = localForm;

  const name = useDebounce(watch('name', ''));
  const description = useDebounce(watch('description', ''));
  const details = useDebounce(watch('details'));

  const { cid: detailsCID, loading: detailsCidLoading } = useCid({
    type: '1.0',
    data: { name, description },
  });

  const { writeAsync, isLoading } = useHatDetailsUpdate({
    hatsAddress: CONFIG.hatsAddress,
    chainId,
    hatId: _.get(hatData, 'id'),
    details: customDetails ? detailsCID : details,
  });

  const onSubmit = async () => {
    writeAsync?.();
    if (customDetails) {
      await pinJson(
        { type: '1.0', data: { name, description } },
        {
          name: `details_${_.toString(chainId)}_${prettyIdToIp(
            _.get(hatData, 'admin.id'),
          )}`,
        },
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <FormControl>
          <Stack>
            <Switch
              isChecked={customDetails}
              onChange={() => setCustomDetails(!customDetails)}
            >
              Custom details
            </Switch>
            {!customDetails && (
              <Textarea
                localForm={localForm}
                name='details'
                label='Details'
                placeholder='Hat details'
              />
            )}
            {customDetails && (
              <Stack spacing={2}>
                <Input
                  localForm={localForm}
                  name='name'
                  label='Name'
                  placeholder='Hat name'
                />
                <Textarea
                  localForm={localForm}
                  name='description'
                  label='Description'
                  placeholder='Hat description'
                />
              </Stack>
            )}
          </Stack>
        </FormControl>

        <Flex justify='flex-end'>
          <Button
            type='submit'
            isDisabled={!writeAsync || detailsCidLoading || isLoading}
          >
            {detailsCidLoading ? <Spinner /> : 'Update'}
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default HatDetailsForm;
