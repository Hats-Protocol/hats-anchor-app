/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { Box, Image, Stack, Text, useMediaQuery } from '@chakra-ui/react';
import { CONFIG } from '@hatsprotocol/constants';
import { AppHat } from 'hats-types';
import dynamic from 'next/dynamic';
import { ReactNode, useEffect, useState } from 'react';
import { useAccount, useConfig, useConnect } from 'wagmi';

import CommandPalette from './CommandPalette';

const Navbar = dynamic(() => import('./Navbar'));

const Layout = ({ editMode, hatData, children }: LayoutProps) => {
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
        bgColor={editMode ? 'cyan.100' : 'gray.100'}
        backgroundImage='/bg-topography.svg'
        backgroundRepeat='repeat'
        position='fixed'
        h='100%'
        w='100%'
        zIndex={-1}
      />
      <CommandPalette />
      {!upTo780 ? (
        <>
          <Navbar hatData={hatData} />
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
          <Text size='xl' variant='medium'>
            Hello, Hat Wearer 🧢
          </Text>
          <Text size='xl' variant='medium'>
            The Hats App is not currently optimized for mobile usage.
          </Text>
          <Text size='xl' variant='medium'>
            Please visit <a href={CONFIG.APP_URL}>app.hatsprotocol.xyz</a> from
            a desktop device.
          </Text>
        </Stack>
      )}
    </Box>
  );
};

export default Layout;

interface LayoutProps {
  editMode?: boolean;
  hatData?: AppHat;
  children: ReactNode;
}
