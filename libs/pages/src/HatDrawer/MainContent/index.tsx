import { Heading, Stack } from '@chakra-ui/react';
import { MODULE_TYPES } from '@hatsprotocol/constants';
import { useTreeForm } from 'contexts';
import { useMediaStyles, useScrollPosition } from 'hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { checkAddressIsContract } from 'utils';
import { Hex } from 'viem';

import WearersList from '../WearersList';
import DetailList from './DetailList';
import Header from './Header';
import LinkRequests from './LinkRequests';

const EventHistory = dynamic(() =>
  import('ui').then((mod) => mod.EventHistory),
);
const ModuleDetails = dynamic(() =>
  import('ui').then((mod) => mod.ModuleDetails),
);
const AuthoritiesList = dynamic(() =>
  import('ui').then((mod) => mod.AuthoritiesList),
);
const ResponsibilitiesList = dynamic(() =>
  import('ui').then((mod) => mod.ResponsibilitiesList),
);
const StatusCard = dynamic(() => import('ui').then((mod) => mod.StatusCard));

const MainContent = ({
  showBottomMenu,
  setShowBottomMenu,
}: {
  showBottomMenu?: boolean;
  setShowBottomMenu?: (b: boolean) => void;
}) => {
  const { chainId, selectedHat, selectedHatDetails } = useTreeForm();
  const [isEligibilityAContract, setIsEligibilityAContract] = useState(false);
  const [isToggleAContract, setIsToggleAContract] = useState(false);
  const { isMobile } = useMediaStyles();

  const { toggle, eligibility } = _.pick(selectedHatDetails, [
    'toggle',
    'eligibility',
  ]);

  useScrollPosition(
    ({ prevPos, currPos }) => {
      const isShow = currPos.y > prevPos.y;
      // eslint-disable-next-line no-console
      console.debug('prevPos', prevPos, 'currPos', currPos, 'isShow', isShow);
      if (isShow !== showBottomMenu) setShowBottomMenu?.(isShow);
    },
    [showBottomMenu],
  );

  useEffect(() => {
    const check = async () => {
      const checkPromises = [
        await checkAddressIsContract(selectedHat?.eligibility as Hex, chainId),
        await checkAddressIsContract(selectedHat?.toggle as Hex, chainId),
      ];
      const data: boolean[] = await Promise.all(checkPromises);
      setIsEligibilityAContract(_.first(data) || false);
      setIsToggleAContract(_.nth(data, 1) || false);
    };
    check();
  }, [chainId, selectedHat]);

  if (!selectedHat) return null;

  return (
    <Stack
      // apply x padding on components for section background handling
      spacing={10}
      w='100%'
      overflowY={{ base: 'auto', md: 'scroll' }}
      height={{ base: 'auto', md: 'calc(100% - 150px)' }}
      pb={{ base: 100, md: 400 }}
      color='blackAlpha.800'
      bg='gray.50'
    >
      <Header />
      <AuthoritiesList />
      <ResponsibilitiesList />
      <WearersList />

      <Stack spacing={4} bg='gray.50'>
        {(selectedHat.isLinked || selectedHat.levelAtLocalTree !== 0) && (
          <StatusCard
            status={MODULE_TYPES.eligibility}
            isAContract={isEligibilityAContract}
            label={
              isMobile
                ? 'Can I wear this Hat?'
                : 'Do I meet the requirements to wear this Hat?'
            }
          />
        )}
        <ModuleDetails type={MODULE_TYPES.eligibility} />
        {!_.isEmpty(eligibility?.criteria) && (
          <DetailList
            title='Eligibility Criteria'
            details={eligibility?.criteria}
            inline
          />
        )}
      </Stack>

      <Stack spacing={4}>
        {(selectedHat.isLinked || selectedHat.levelAtLocalTree !== 0) && (
          <StatusCard
            status={MODULE_TYPES.toggle}
            isAContract={isToggleAContract}
            label='Is this hat active?'
          />
        )}
        <ModuleDetails type={MODULE_TYPES.toggle} />
        {!_.isEmpty(toggle?.criteria) && (
          <DetailList
            title='Toggle Criteria'
            details={toggle?.criteria}
            inline
          />
        )}
      </Stack>

      <LinkRequests />

      <Stack spacing={1} px={{ base: 4, md: 10 }}>
        <Heading size={{ base: 'sm', md: 'md' }} variant='medium'>
          Hat History
        </Heading>
        <EventHistory type='hat' />
      </Stack>
    </Stack>
  );
};

export default MainContent;

// interface MainContentProps {
//   linkRequestFromTree: any[];
// }
