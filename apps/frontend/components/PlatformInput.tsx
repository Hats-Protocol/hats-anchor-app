import { HStack, IconButton, Spinner } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import _, { debounce } from 'lodash';
import { useEffect, useState } from 'react';
import { FaCheck, FaTrash } from 'react-icons/fa';
import { Input } from 'ui';

import { useHatForm } from '../contexts/HatFormContext';

const fetchGuild = async (guildName: string) => {
  const response = await fetch(`https://api.guild.xyz/v1/guild/${guildName}`);
  return response.ok;
};

const fetchSpace = async (spaceId: string) => {
  const response = await fetch('https://hub.snapshot.org/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        query GetSpace($id: String!) {
          space(id: $id) {
            id
          }
        }
      `,
      variables: { id: spaceId },
    }),
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }

  const result = await response.json();
  return result.data.space;
};

type PlatformInputProps = {
  type: 'snapshot' | 'guild';
  name: string;
  remove: (index: number) => void;
  index: number;
  fieldsLength: number;
};

const PlatformInput = ({
  type,
  name,
  remove,
  index,
  fieldsLength,
}: PlatformInputProps) => {
  const [inputValue, setInputValue] = useState('');
  const { localForm } = useHatForm();
  const { setValue } = _.pick(localForm, ['setValue']);

  const {
    data: dataExists,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: [`${type}Exists`, inputValue],
    queryFn:
      type === 'guild'
        ? () => fetchGuild(inputValue)
        : () => fetchSpace(inputValue),
    enabled: false,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  useEffect(() => {
    const debouncedRefetch = debounce(() => {
      if (inputValue) {
        refetch();
      }
    }, 300);

    debouncedRefetch();

    return () => debouncedRefetch.cancel();
  }, [inputValue, refetch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setValue?.(name, newValue);
  };

  if (!localForm) return null;

  return (
    <HStack>
      <Input
        name={name}
        localForm={localForm}
        placeholder={
          type === 'guild'
            ? 'Guild name (e.g. hats-protocol)'
            : 'Space ID (e.g. hatsprotocol.eth)'
        }
        isDisabled={index !== fieldsLength - 1}
        onChange={handleChange}
        rightElement={
          // eslint-disable-next-line no-nested-ternary
          dataExists ? (
            <FaCheck color='green' />
          ) : isLoading && inputValue ? (
            <Spinner size='sm' color='blue.500' />
          ) : null
        }
      />
      <IconButton
        type='button'
        onClick={() => remove(index)}
        icon={<FaTrash />}
        aria-label='Remove'
        variant='outline'
        color='blackAlpha.400'
        borderColor='blackAlpha.400'
        height={9}
        w={16}
      />
    </HStack>
  );
};

export default PlatformInput;
