import _ from 'lodash';
import {
  Stack,
  Flex,
  Button,
  Text,
  Code,
  Tooltip,
  Input,
  Box,
} from '@chakra-ui/react';
import { useState } from 'react';
import useHatGuild from '../hooks/useHatGuild';

const HatGuildForm = ({ hatData, chainId, treeId }) => {
  const [guildName, setGuildName] = useState('');

  const { guildNames, saveGuild, deleteGuild } = useHatGuild({
    chainId,
    treeId,
    hatId: hatData?.id,
  });

  return (
    <Stack spacing={4}>
      <Box>
        <Text>Guilds bound to this hat:</Text>
        <Text>
          {guildNames.map((guild) => (
            <Code key={guild}>{guild}</Code>
          ))}
        </Text>
      </Box>
      <Input
        placeholder='Guild Name'
        onChange={(e) => setGuildName(e.target.value)}
        value={guildName}
      />

      <Flex justify='flex-end' gap={2}>
        <Tooltip
          label='Guild with this name already bound to this tree'
          aria-label='Guild with this name already bound to this tree'
          isDisabled={!guildNames.includes(guildName)}
        >
          <Button
            onClick={() => saveGuild(guildName)}
            isDisabled={guildNames.includes(guildName) || !guildName}
          >
            Save guild
          </Button>
        </Tooltip>
        <Button onClick={() => deleteGuild(guildName)}>Delete guild</Button>
      </Flex>
    </Stack>
  );
};

export default HatGuildForm;
