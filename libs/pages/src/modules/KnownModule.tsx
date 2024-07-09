'use client';

import { Box, Card, CardBody, Stack } from '@chakra-ui/react';
import dynamic from 'next/dynamic';

const Header = dynamic(() => import('modules-ui').then((mod) => mod.Header));
const Layout = dynamic(() =>
  import('molecules').then((mod) => mod.StandaloneLayout),
);
const SlimModuleDetails = dynamic(() =>
  import('modules-ui').then((mod) => mod.SlimModuleDetails),
);

const KnownModule = () => {
  return (
    <Layout title='Claims'>
      <Stack w='60%' maxW='1200px' mx='auto' py={120} spacing={10}>
        <Box w='90%' mx='auto'>
          <Header />
        </Box>

        <Card>
          <CardBody>
            <SlimModuleDetails type='eligibility' />
          </CardBody>
        </Card>
      </Stack>
    </Layout>
  );
};

export default KnownModule;
