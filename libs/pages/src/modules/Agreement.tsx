import { Box, HStack } from '@chakra-ui/react';
import { CONFIG } from '@hatsprotocol/constants';
import { useMediaStyles } from 'hooks';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { fetchIpfs } from 'utils';

const Layout = dynamic(() => import('ui').then((mod) => mod.StandaloneLayout));
const ClaimHat = dynamic(() =>
  import('modules-ui').then((mod) => mod.ClaimHat),
);
const AgreementContent = dynamic(() =>
  import('modules-ui').then((mod) => mod.AgreementContent),
);
const HatDetails = dynamic(() =>
  import('modules-ui').then((mod) => mod.HatDetails),
);
const BottomMenu = dynamic(() =>
  import('modules-ui').then((mod) => mod.BottomMenu),
);

const Agreement = () => {
  const [agreement, setAgreement] = useState('');
  const { isMobile } = useMediaStyles();
  useEffect(() => {
    const fetchIPFS = async () => {
      // get the module ipfs details
      const res = await fetchIpfs(CONFIG.agreementV0.ipfsHash);
      if (res) {
        setAgreement(res.data);
      }
    };

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
          base: 0,
          lg: 20,
        }}
        pt={{
          base: 0,
          lg: 120,
        }}
        h='100%'
        direction={{
          base: 'column',
          lg: 'row',
        }}
      >
        {!isMobile && (
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
            <AgreementContent agreement={agreement} />
          </Box>
        )}

        <HatDetails />

        {!isMobile && <ClaimHat agreement={agreement} />}

        <BottomMenu />
      </HStack>
    </Layout>
  );
};

export default Agreement;
