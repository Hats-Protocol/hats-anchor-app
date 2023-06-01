import React, { useState } from 'react';
import {
  Stack,
  Flex,
  Button,
  Spinner,
  FormControl,
  Switch,
  IconButton,
  InputGroup,
  Input as ChakraInput,
  InputLeftElement,
  Box,
  Tooltip,
  Text,
  Icon,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import _ from 'lodash';
import { FaCheck, FaHouseUser, FaInfo, FaTrash } from 'react-icons/fa';

import Input from '@/components/Input';
import Textarea from '@/components/Textarea';
import useHatDetailsUpdate from '@/hooks/useHatDetailsUpdate';
import useDebounce from '@/hooks/useDebounce';
import CONFIG from '@/constants';
import { pinJson } from '@/lib/ipfs';
import useCid from '@/hooks/useCid';
import { isTopHat, prettyIdToIp } from '@/lib/hats';

const HatDetailsForm = ({ hatData, hatDetails, chainId }) => {
  const [customDetails, setCustomDetails] = useState(true);
  const [guilds, setGuilds] = useState(hatDetails?.guilds || []);
  const [newGuild, setNewGuild] = useState('');

  const localForm = useForm({
    mode: 'onChange',
    defaultValues: {
      name: hatDetails?.name || '',
      description: hatDetails?.description || '',
    },
  });
  const { handleSubmit, watch } = localForm;

  const name = useDebounce(watch('name', hatDetails?.name || ''));
  const description = useDebounce(
    watch('description', hatDetails?.description || ''),
  );
  const details = useDebounce(watch('details'));

  const { cid: detailsCID, loading: detailsCidLoading } = useCid({
    type: '1.0',
    data: { name, description, guilds },
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
        { type: '1.0', data: { name, description, guilds } },
        {
          name: `details_${_.toString(chainId)}_${prettyIdToIp(
            _.get(hatData, 'admin.id'),
          )}`,
        },
      );
    }
  };

  const handleAddGuild = () => {
    setGuilds([...guilds, newGuild]);
    setNewGuild('');
  };

  const handleRemoveGuild = (index) => {
    setGuilds(guilds.filter((__, i) => i !== index));
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
                {isTopHat(hatData) && (
                  <>
                    <Text fontSize='sm' color='blue.500' pt={3}>
                      <Icon as={FaInfo} mr={1} />
                      Bind one or more guild.xyz to this hat. Remember to click
                      the checkmark to add the guild.
                    </Text>
                    <Flex alignItems='center'>
                      <InputGroup>
                        <InputLeftElement>
                          <FaHouseUser ml={2} />
                        </InputLeftElement>
                        <ChakraInput
                          w='calc(100% - 1rem)'
                          textOverflow='ellipsis'
                          type='guild'
                          placeholder='Guild name (e.g. hats-protocol)'
                          value={newGuild}
                          onChange={(e) => setNewGuild(e.target.value)}
                        />
                      </InputGroup>
                      <Tooltip
                        label={!newGuild ? 'Please input a guild name' : ''}
                        shouldWrapChildren
                      >
                        <IconButton
                          isDisabled={!newGuild}
                          onClick={handleAddGuild}
                          icon={<FaCheck />}
                          aria-label='Add'
                          height={9}
                          w={16}
                        />
                      </Tooltip>
                    </Flex>
                    {guilds.map((guild, index) => (
                      <Box key={guild}>
                        <Flex
                          align='center'
                          w='full'
                          justifyContent='space-between'
                        >
                          <ChakraInput
                            value={guild}
                            readOnly
                            w='calc(100% - 5rem)'
                          />
                          <IconButton
                            type='button'
                            onClick={() => handleRemoveGuild(index)}
                            icon={<FaTrash />}
                            aria-label='Remove'
                            height={9}
                            w={16}
                          />
                        </Flex>
                      </Box>
                    ))}
                  </>
                )}
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
