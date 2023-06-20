/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import React, { useEffect, useState, ReactNode } from 'react';
import { Box } from '@chakra-ui/react';
import { useAccount, useConnect, useConfig } from 'wagmi';

import CommandPalette from '@/components/CommandPalette';
import Navbar from '@/components/Navbar';

const Layout = ({ children }: { children: ReactNode }) => {
  const [isAutoConnecting, setIsAutoConnecting] = useState(false);
  const { address } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const client = useConfig();

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
        position='fixed'
        h='100%'
        w='100%'
      />
      <Navbar />
      <CommandPalette />
      <Box h='100vh' w='100vw'>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
