'use client';

import { Heading, Stack } from '@chakra-ui/react';
import dynamic from 'next/dynamic';

const EventHistory = dynamic(() =>
  import('molecules').then((mod) => mod.EventHistory),
);

const HatHistory = () => {
  return (
    <Stack spacing={1} px={{ base: 4, md: 16 }}>
      <Heading size='md' variant={{ base: 'medium', md: 'default' }}>
        Hat History
      </Heading>
      <EventHistory type='hat' />
    </Stack>
  );
};

export default HatHistory;
