import { Box, HStack } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const Layout = dynamic(() => import('ui').then((mod) => mod.StandaloneLayout));
const ClaimHat = dynamic(() =>
  import('modules-ui').then((mod) => mod.ClaimHat),
);
const Agreement = dynamic(() =>
  import('modules-ui').then((mod) => mod.Agreement),
);

const CommunityAgreement = () => {
  const [agreement] = useState('');

  const fetchIPFS = async () => {
    // const res = await fetchIpfs(AGREEMENT_IPFS_HASH);
    // if (res) {
    //   setAgreement(res.data);
    // }
  };

  useEffect(() => {
    fetchIPFS();
  }, []);

  return (
    <Layout title='Claims'>
      <HStack
        spacing={{
          base: 12,
          lg: 20,
        }}
        px={{
          base: 12,
          lg: 20,
        }}
        pt={{
          base: 82,
          lg: 120,
        }}
        h='100%'
      >
        <Box
          py={5}
          px={10}
          maxH='90%'
          overflowY='auto'
          w={{
            base: '50%',
            lg: '70%',
          }}
          backgroundColor='white'
          border='1px solid #cbcbcb'
        >
          <Agreement agreement={agreement} />
        </Box>

        <ClaimHat agreement={agreement} />
      </HStack>
    </Layout>
  );
};

export default CommunityAgreement;
