import { Heading, Stack } from '@chakra-ui/react';
import dynamic from 'next/dynamic';

const EventHistory = dynamic(() =>
  import('ui').then((mod) => mod.EventHistory),
);

const HatHistory = () => {
  return (
    <Stack spacing={1} px={{ base: 4, md: 10 }}>
      <Heading size={{ base: 'sm', md: 'md' }} variant='medium'>
        Hat History
      </Heading>
      <EventHistory type='hat' />
    </Stack>
  );
};

export default HatHistory;
