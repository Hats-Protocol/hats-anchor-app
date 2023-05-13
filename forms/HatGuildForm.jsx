import {
  Stack,
  Flex,
  Button,
  Text,
  Code,
  Tooltip,
  Input,
  HStack,
} from '@chakra-ui/react';
import { useState } from 'react';
import useHatGuild from '../hooks/useHatGuild';

const HatGuildForm = ({ hatData, chainId, treeId }) => {
  const [guildName, setGuildName] = useState('');

  const { guildNames, createGuild, deleteGuild, updateGuild } = useHatGuild({
    chainId,
    treeId,
    hatId: hatData?.id,
  });

  return (
    <Stack spacing={4}>
      {guildNames?.length > 0 && (
        <HStack>
          <Text>Guild that is bound to this hat:</Text>
          <Text>
            {guildNames.map((guild) => (
              <Code key={guild}>{guild}</Code>
            ))}
          </Text>
        </HStack>
      )}
      <Input
        placeholder='Guild Name'
        onChange={(e) => setGuildName(e.target.value)}
        value={guildName}
      />

      <Flex justify='flex-end' gap={2}>
        {!guildNames && (
          <Tooltip
            label='Guild with this name already bound to this tree'
            aria-label='Guild with this name already bound to this tree'
            isDisabled={!guildNames?.includes(guildName)}
          >
            <Button
              onClick={() => createGuild(guildName)}
              isDisabled={guildNames?.includes(guildName) || !guildName}
            >
              Save guild
            </Button>
          </Tooltip>
        )}
        <Button
          onClick={() => updateGuild(guildName)}
          isDisabled={guildNames?.includes(guildName) || !guildName}
        >
          Update
        </Button>
        <Button
          onClick={() => deleteGuild(guildName)}
          isDisabled={!guildNames?.includes(guildName)}
        >
          Delete guild
        </Button>
      </Flex>
    </Stack>
  );
};

export default HatGuildForm;
