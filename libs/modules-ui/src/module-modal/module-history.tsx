import { Flex, Heading, Stack, Text } from '@chakra-ui/react';

export const ModuleHistory = () => {
  return null;

  // TODO get history from ancillary subgraph

  return (
    <Stack>
      <Heading size='sm'>History</Heading>

      <Flex justify='space-between'>
        <Text size='sm'>10 addresses added</Text>

        <Text size='sm'>4 days ago</Text>
      </Flex>
    </Stack>
  );
};
