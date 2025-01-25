'use client';

import { useQuery } from '@tanstack/react-query';
import { useHatForm } from 'contexts';
import { debounce, pick } from 'lodash';
import { useEffect, useState } from 'react';
import { FaCheck, FaTrash } from 'react-icons/fa';
import { Button, Skeleton } from 'ui';

import { Input } from './input';

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

const PlatformInput = ({ type, name, remove, index, fieldsLength }: PlatformInputProps) => {
  const [inputValue, setInputValue] = useState('');
  const { localForm } = useHatForm();
  const { setValue } = pick(localForm, ['setValue']);

  const {
    data: dataExists,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: [`${type}Exists`, inputValue],
    queryFn: type === 'guild' ? () => fetchGuild(inputValue) : () => fetchSpace(inputValue),
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
    <div className='flex items-center gap-2'>
      <Input
        name={name}
        localForm={localForm}
        placeholder={type === 'guild' ? 'Guild name (e.g. hats-protocol)' : 'Space ID (e.g. hatsprotocol.eth)'}
        isDisabled={index !== fieldsLength - 1}
        onChange={handleChange}
        // variant='outline'
        rightElement={
          // eslint-disable-next-line no-nested-ternary
          dataExists ? (
            <FaCheck color='green' />
          ) : isLoading && inputValue ? (
            <Skeleton className='h-9 w-9 bg-blue-500' />
          ) : null
        }
      />
      <Button
        type='button'
        onClick={() => remove(index)}
        aria-label='Remove'
        variant='outline'
        className='h-9 w-9 bg-slate-400'
      >
        <FaTrash />
      </Button>
    </div>
  );
};

export { PlatformInput, type PlatformInputProps };
