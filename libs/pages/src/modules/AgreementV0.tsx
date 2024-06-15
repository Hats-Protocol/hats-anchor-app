'use client';

import { Box, Flex, Stack } from '@chakra-ui/react';
import { CONFIG } from '@hatsprotocol/constants';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { fetchIpfs } from 'utils';

const Layout = dynamic(() => import('ui').then((mod) => mod.StandaloneLayout));
const ClaimHat = dynamic(() =>
  import('modules-ui').then((mod) => mod.ClaimHatV0),
);
const Header = dynamic(() => import('modules-ui').then((mod) => mod.Header));
const AgreementContent = dynamic(() =>
  import('modules-ui').then((mod) => mod.AgreementContent),
);

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
        px={{ base: 6, md: 10, lg: 20 }}
        py={120}
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
        >
          <Box
            py={5}
            px={10}
            h='50%'
            maxH='600px'
            overflowY='scroll'
            w={{ base: '100%', md: '70%' }}
            backgroundColor='white'
            border='1px solid #cbcbcb'
          >
            <AgreementContent agreement={agreement} />
          </Box>

          <ClaimHat agreement={agreement} />
        </Flex>
      </Stack>
    </Layout>
  );
};

export default AgreementV0;
