import { Box, Heading, Stack } from '@chakra-ui/react';
import { useTreeForm } from 'contexts';
import dynamic from 'next/dynamic';

import WearersList from '../WearersList';
import Header from './Header';

const EventHistory = dynamic(() =>
  import('ui').then((mod) => mod.EventHistory),
);
const AuthoritiesList = dynamic(() =>
  import('ui').then((mod) => mod.AuthoritiesList),
);
const ResponsibilitiesList = dynamic(() =>
  import('ui').then((mod) => mod.ResponsibilitiesList),
);

const MainContent = () => {
  const { selectedHat } = useTreeForm();

  if (!selectedHat) return null;

  return (
    <Box
      w='100%'
      overflowY='scroll'
      pos='relative'
      color='blackAlpha.800'
      height='full'
      pt={14}
      pb='73px'
    >
      <Header />

      <Stack spacing={10} px={4} background='gray.50' pb={10} pt={4}>
        <AuthoritiesList />
        <ResponsibilitiesList />
        <WearersList />

        <Stack spacing={1}>
          <Heading size='sm' variant='medium' textTransform='uppercase'>
            Event history
          </Heading>
          <EventHistory type='hat' />
        </Stack>
      </Stack>
    </Box>
  );
};

export default MainContent;
