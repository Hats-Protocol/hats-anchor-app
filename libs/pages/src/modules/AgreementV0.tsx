'use client';

import { Box, Flex, Stack } from '@chakra-ui/react';
import { CONFIG } from '@hatsprotocol/constants';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { fetchIpfs } from 'utils';

const Layout = dynamic(() =>
  import('molecules').then((mod) => mod.StandaloneLayout),
);
const ClaimHat = dynamic(() =>
  import('modules-ui').then((mod) => mod.ClaimHatV0),
);
const Header = dynamic(() => import('modules-ui').then((mod) => mod.Header));
const AgreementContent = dynamic(() =>
  import('modules-ui').then((mod) => mod.AgreementContent),
);
const HatDeco = dynamic(() => import('ui').then((mod) => mod.HatDeco));

const AgreementV0 = () => {
  const [agreement, setAgreement] = useState('');

  useEffect(() => {
    const fetchIPFS = async () => {
      const res = await fetchIpfs(CONFIG.agreementV0.ipfsHash);
      if (res) {
        setAgreement(res.data);
      }
    };

    fetchIPFS();
  }, []);

  return (
    <Layout title='Claims'>
      <Stack
        px={{ base: 0, md: 10, lg: 20 }}
        py={{ base: 0, md: 120 }}
        gap={{ base: 10, md: 20 }}
      >
        <Flex maxW='100%' justifyContent='center'>
          <Header />
        </Flex>

        <Flex
          gap={{
            base: 12,
            lg: 20,
          }}
          direction={{ base: 'column', md: 'row' }}
          px={{ base: 4, md: 0 }}
        >
          <Box
            py={5}
            px={{ base: 4, md: 10 }}
            h='50%'
            maxH='600px'
            overflowY='scroll'
            w={{ base: '100%', md: '70%' }}
            backgroundColor='white'
            border='1px solid #cbcbcb'
          >
            <AgreementContent agreement={agreement} />
          </Box>

          <Box px={{ base: 4, md: 0 }} w={{ base: '100%', md: '30%' }}>
            <ClaimHat agreement={agreement} />
          </Box>

          <Box display={{ base: 'block', md: 'none' }}>
            <HatDeco />
          </Box>
        </Flex>
      </Stack>
    </Layout>
  );
};

export default AgreementV0;
