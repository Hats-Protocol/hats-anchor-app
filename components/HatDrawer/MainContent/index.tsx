import { Box, Heading, Stack } from '@chakra-ui/react';
import _ from 'lodash';
import { useEffect, useState } from 'react';

import EventHistory from '@/components/EventHistory';
import WearersList from '@/components/HatDrawer/WearersList';
import { useTreeForm } from '@/contexts/TreeFormContext';
import useHatGuilds from '@/hooks/useGuilds';
import { checkAddressIsContract } from '@/lib/contract';

import DetailList from './DetailList';
import GuildRoles from './GuildRoles';
import Header from './Header';
import LinkRequests from './LinkRequests';
import StatusCard from './Status';

const MainContent = () => {
  const { chainId, selectedHat, selectedHatDetails } = useTreeForm();
  const [isEligibilityAContract, setIsEligibilityAContract] = useState(false);
  const [isToggleAContract, setIsToggleAContract] = useState(false);

  const { responsibilities, authorities, toggle, eligibility } = _.pick(
    selectedHatDetails,
    ['responsibilities', 'authorities', 'toggle', 'eligibility'],
  );

  const { hatRoles } = useHatGuilds();

  useEffect(() => {
    const check = async () => {
      const checkPromises = [
        await checkAddressIsContract(selectedHat?.eligibility, chainId),
        await checkAddressIsContract(selectedHat?.toggle, chainId),
      ];
      const data: unknown[] = await Promise.all(checkPromises);
      setIsEligibilityAContract(_.first(data) as boolean);
      setIsToggleAContract(_.nth(data, 1) as boolean);
    };
    check();
  }, [chainId, selectedHat]);

  if (!selectedHat) return null;

  return (
    <Stack
      p={10}
      pt={8}
      spacing={10}
      w='100%'
      overflow='scroll'
      height='calc(100% - 150px)'
      top={75}
      pos='relative'
    >
      <Header />

      <WearersList />

      <GuildRoles hatRoles={hatRoles} />

      <DetailList title='Responsibilities' details={responsibilities} />
      <DetailList title='Authorities' details={authorities} />

      {!_.isEmpty(toggle?.criteria) && (
        <DetailList title='Toggle Criteria' details={toggle?.criteria} />
      )}
      {!_.isEmpty(eligibility?.criteria) && (
        <DetailList
          title='Eligibility Criteria'
          details={eligibility?.criteria}
        />
      )}

      {(selectedHat.isLinked || selectedHat.levelAtLocalTree !== 0) && (
        <StatusCard
          status='eligibility'
          isAContract={isEligibilityAContract}
          label='Can I wear this hat?'
        />
      )}

      {(selectedHat.isLinked || selectedHat.levelAtLocalTree !== 0) && (
        <StatusCard
          status='toggle'
          isAContract={isToggleAContract}
          label='Is this hat active?'
        />
      )}

      <LinkRequests />

      <Box>
        <Heading size='sm' fontWeight='medium' textTransform='uppercase' mb={1}>
          Event history
        </Heading>
        <EventHistory type='hat' />
      </Box>
    </Stack>
  );
};

export default MainContent;

// interface MainContentProps {
//   linkRequestFromTree: any[];
// }
