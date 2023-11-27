import { HStack, IconButton, Spinner } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { debounce } from 'lodash';
import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FaCheck, FaTrash } from 'react-icons/fa';

import Input from '@/components/atoms/Input';

const fetchSpace = async (spaceId: string) => {
  const response = await fetch('https://hub.snapshot.org/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        query GetSpace($id: String!) {
          space(id: $id) {
            id
            network
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

type SpaceInputProps = {
  name: string;
  remove: (index: number) => void;
  index: number;
  fieldsLength: number;
  localForm: UseFormReturn<any>;
};

const SpaceInput = ({
  name,
  remove,
  index,
  fieldsLength,
  localForm,
}: SpaceInputProps) => {
  const [spaceId, setSpaceId] = useState('');
  const { setValue } = localForm;
  const {
    data: spaceExists,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ['spaceExists', spaceId],
    queryFn: () => fetchSpace(spaceId),
    enabled: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSpaceId(newValue);
    setValue(name, newValue);
  };

  useEffect(() => {
    const debouncedRefetch = debounce(() => {
      if (spaceId) {
        refetch();
      }
    }, 300);

    debouncedRefetch();

    return () => debouncedRefetch.cancel();
  }, [spaceId, refetch]);

  return (
    <HStack>
      <Input
        name={name}
        localForm={localForm}
        placeholder='Space ID (e.g. hatsprotocol.eth)'
        isDisabled={index !== fieldsLength - 1}
        onChange={handleChange}
        rightElement={
          // eslint-disable-next-line no-nested-ternary
          spaceExists ? (
            <FaCheck color='green' />
          ) : isLoading && spaceId ? (
            <Spinner size='sm' color='blue.500' />
          ) : null
        }
      />
      <IconButton
        type='button'
        onClick={() => remove(index)}
        icon={<FaTrash />}
        aria-label='Remove'
        height={9}
        w={16}
      />
    </HStack>
  );
};

export default SpaceInput;
