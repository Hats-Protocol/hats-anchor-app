import { HStack, IconButton } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import _, { debounce } from 'lodash';
import { useEffect, useState } from 'react';
import { FaCheck, FaTrash } from 'react-icons/fa';

import Input from '@/components/atoms/Input';
import { useHatForm } from '@/contexts/HatFormContext';

const fetchGuild = async (guildName: string) => {
  const response = await fetch(`https://api.guild.xyz/v1/guild/${guildName}`);
  return response.ok;
};

type GuildInputProps = {
  name: string;
  remove: (index: number) => void;
  index: number;
  fieldsLength: number;
};

const GuildInput = ({ name, remove, index, fieldsLength }: GuildInputProps) => {
  const [guildName, setGuildName] = useState('');
  const { localForm } = useHatForm();
  const { setValue } = _.pick(localForm, ['setValue']);

  const { data: guildExists, refetch } = useQuery({
    queryKey: ['guildExists', guildName],
    queryFn: () => fetchGuild(guildName),
    enabled: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setGuildName(newValue);
    setValue?.(name, newValue);
  };

  useEffect(() => {
    const debouncedRefetch = debounce(() => {
      if (guildName) {
        refetch();
      }
    }, 300);

    debouncedRefetch();

    return () => debouncedRefetch.cancel();
  }, [guildName, refetch]);

  if (!localForm) return null;

  return (
    <HStack>
      <Input
        name={name}
        localForm={localForm}
        placeholder='Guild name (e.g. hats-protocol)'
        isDisabled={index !== fieldsLength - 1}
        onChange={handleChange}
        rightElement={guildExists && <FaCheck color='green' />}
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

export default GuildInput;
