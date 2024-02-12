/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { Box } from '@chakra-ui/react';
// import { AppHat } from 'hats-types';
import { ReactNode, useEffect, useState } from 'react';
import { useAccount, useConfig, useConnect } from 'wagmi';

import Navbar from './Navbar';

const Layout = ({ children, title }: LayoutProps) => {
  const [isAutoConnecting, setIsAutoConnecting] = useState(false);
  const { address } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const client = useConfig();
  // const [upTo780] = useMediaQuery('(max-width: 780px)');

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
        bgColor='gray.100'
        backgroundImage='/bg-topography.svg'
        backgroundRepeat='repeat'
        position='fixed'
        h='100%'
        w='100%'
        zIndex={-1}
      />

      <Navbar title={title} />
      <Box h={{ base: 'auto', md: '100vh' }} w={{ base: 'auto', md: '100vw' }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;

interface LayoutProps {
  title?: string;
  children: ReactNode;
}
