'use client';

import { useSelectedHat } from 'contexts';
import { useMediaQuery, useScrollPosition } from 'hooks';
import dynamic from 'next/dynamic';
import { SupportedChains } from 'types';
import { HatDeco } from 'ui';

import { AuthoritiesList } from '../../authorities-list';
import { Controllers } from '../../controllers';
import { WearersList } from '../wearers-list';
import { HatHistory } from './hat-history';
import { Header } from './header';
import { LinkRequests } from './link-requests';

const ResponsibilitiesList = dynamic(() => import('molecules').then((mod) => mod.ResponsibilitiesList));
const HatDevDetails = dynamic(() => import('molecules').then((mod) => mod.HatDevDetails));

const MainContent = ({
  showBottomMenu,
  setShowBottomMenu,
}: {
  showBottomMenu?: boolean;
  setShowBottomMenu?: (b: boolean) => void;
}) => {
  const { selectedHat, chainId, eligibilityInfo, isClaimable } = useSelectedHat();
  const isMobile = useMediaQuery('(max-width: 768px)');

  useScrollPosition(
    ({ prevPos, currPos }) => {
      const isShow = currPos.y > prevPos.y;
      if (isShow !== showBottomMenu) setShowBottomMenu?.(isShow);
    },
    [showBottomMenu],
  );

  if (!selectedHat) return null;

  return (
    <div className='h-auto w-full space-y-10 overflow-y-auto bg-gray-50 pb-[100px] md:h-[calc-(100%-150px)] md:overflow-y-scroll md:bg-white/90 md:pb-[400px] md:pt-12 md:backdrop-blur-[2px]'>
      <Header />

      <AuthoritiesList />

      <ResponsibilitiesList />

      <WearersList />

      <Controllers />

      <LinkRequests />

      <HatHistory />

      <HatDevDetails
        selectedHat={selectedHat}
        chainId={chainId as SupportedChains}
        eligibilityInfo={eligibilityInfo}
        isClaimable={isClaimable}
        showDetailsButton
      />

      {isMobile && <HatDeco />}
    </div>
  );
};

export { MainContent };

// interface MainContentProps {
//   linkRequestFromTree: any[];
// }
