import { Stack } from '@chakra-ui/react';
import { useSelectedHat } from 'contexts';
import { useScrollPosition } from 'hooks';
import dynamic from 'next/dynamic';

import WearersList from '../WearersList';
import HatHistory from './HatHistory';
import Header from './Header';
import LinkRequests from './LinkRequests';

const AuthoritiesList = dynamic(() =>
  import('ui').then((mod) => mod.AuthoritiesList),
);
const Controllers = dynamic(() => import('ui').then((mod) => mod.Controllers));
const ResponsibilitiesList = dynamic(() =>
  import('ui').then((mod) => mod.ResponsibilitiesList),
);

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
    </Stack>
  );
};

export default MainContent;

// interface MainContentProps {
//   linkRequestFromTree: any[];
// }
