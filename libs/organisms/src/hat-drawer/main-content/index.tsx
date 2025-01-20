'use client';

import { Stack } from '@chakra-ui/react';
import { useSelectedHat } from 'contexts';
import { useScrollPosition } from 'hooks';
import dynamic from 'next/dynamic';
import { Controllers } from 'organisms';

import { WearersList } from '../wearers-list';
import { HatHistory } from './hat-history';
import { Header } from './header';
import { LinkRequests } from './link-requests';
import { AuthoritiesList } from '../../authorities-list';

const ResponsibilitiesList = dynamic(() => import('molecules').then((mod) => mod.ResponsibilitiesList));
const HatDevDetails = dynamic(() => import('molecules').then((mod) => mod.HatDevDetails));

const MainContent = ({
  showBottomMenu,
  setShowBottomMenu,
}: {
  showBottomMenu?: boolean;
  setShowBottomMenu?: (b: boolean) => void;
}) => {
  const { selectedHat } = useSelectedHat();

  useScrollPosition(
    ({ prevPos, currPos }) => {
      const isShow = currPos.y > prevPos.y;
      // eslint-disable-next-line no-console
      console.debug('prevPos', prevPos, 'currPos', currPos, 'isShow', isShow);
      if (isShow !== showBottomMenu) setShowBottomMenu?.(isShow);
    },
    [showBottomMenu],
  );

  if (!selectedHat) return null;

  return (
    <Stack
      // apply x padding on components for section background handling
      spacing={8}
      w='100%'
      overflowY={{ base: 'auto', md: 'scroll' }}
      height={{ base: 'auto', md: 'calc(100% - 150px)' }}
      pb={{ base: 100, md: 400 }}
      color='blackAlpha.800'
      bg={{ base: 'gray.50', md: 'whiteAlpha.200' }}
      backdropFilter={{ base: 'none', md: 'blur(2px)' }}
    >
      <Header />

      <AuthoritiesList />

      <ResponsibilitiesList />

      <WearersList />

      <Controllers />

      <LinkRequests />

      <HatHistory />

      <HatDevDetails />
    </Stack>
  );
};

export { MainContent };

// interface MainContentProps {
//   linkRequestFromTree: any[];
// }
