'use client';

import { SelectedHatContextProvider, TreeFormContextProvider } from 'contexts';
import dynamic from 'next/dynamic';

const HatDrawer = dynamic(() => import('organisms').then((mod) => ({ default: mod.HatDrawer })), {
  ssr: false,
});

const HatDetailsClient = () => (
  <TreeFormContextProvider>
    <SelectedHatContextProvider>
      <HatDrawer />
    </SelectedHatContextProvider>
  </TreeFormContextProvider>
);

export { HatDetailsClient };
