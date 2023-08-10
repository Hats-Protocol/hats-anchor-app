/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { Box, Image, Stack, Text, useMediaQuery } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { ReactNode, useEffect, useState } from 'react';
import { useAccount, useConfig, useConnect } from 'wagmi';

const Navbar = dynamic(() => import('@/components/Navbar'));

const Layout = ({ children }: { children: ReactNode }) => {
  const [isAutoConnecting, setIsAutoConnecting] = useState(false);
  const { address } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const client = useConfig();
  const [upTo780] = useMediaQuery('(max-width: 780px)');

  useEffect(() => {
    if (isAutoConnecting) return;
    if (address) return;

    setIsAutoConnecting(true);

    const autoConnect = async () => {
      const lastUsedConnector = client.storage?.getItem('wallet');

      const sorted = lastUsedConnector
        ? [...connectors].sort((x) => (x.id === lastUsedConnector ? -1 : 1))
        : connectors;

      for (const connector of sorted) {
        if (!connector.ready || !connector.isAuthorized) continue;
        const isAuthorized = await connector.isAuthorized();
        if (!isAuthorized) continue;

        await connectAsync({ connector });
        break;
      }
    };

    autoConnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box>
      <Box
        backgroundImage='/bg-topography.svg'
        backgroundRepeat='repeat'
        position='fixed'
        h='100%'
        w='100%'
        zIndex={-1}
      />
      {!upTo780 ? (
        <>
          <Navbar />
          <Box h='100vh' w='100vw'>
            {children}
          </Box>
        </>
      ) : (
        <Stack
          textAlign='center'
          h='100vh'
          justifyContent='center'
          px={10}
          alignItems='center'
          spacing={4}
        >
          <Image src='/icons/hats.svg' alt='Hat' h={150} w={150} mb={4} />
          <Text fontWeight={600} fontSize={20}>
            Hello, Hat Wearer 🧢
          </Text>
          <Text fontWeight={500} fontSize={20}>
            The Hats App is not currently optimized for mobile usage.
          </Text>
          <Text fontWeight={500} fontSize={20}>
            Please visit{' '}
            <a href='https://app.hatsprotocol.xyz'>app.hatsprotocol.xyz</a> from
            a desktop device.
          </Text>
        </Stack>
      )}
    </Box>
  );
};

export default Layout;
