import { Box, Heading, Stack } from '@chakra-ui/react';
import _ from 'lodash';
import { useEffect, useState } from 'react';

import EventHistory from '@/components/EventHistory';
import WearersList from '@/components/HatDrawer/WearersList';
import ModuleDetails from '@/components/ModuleDetails';
import { MODULE_TYPES } from '@/constants';
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
      const data: boolean[] = await Promise.all(checkPromises);
      setIsEligibilityAContract(_.first(data) || false);
      setIsToggleAContract(_.nth(data, 1) || false);
    };
    check();
  }, [chainId, selectedHat]);

  if (!selectedHat) return null;

  return (
    <Stack
      p={10}
      spacing={10}
      w='100%'
      overflow='scroll'
      height='calc(100% - 150px)'
      pos='relative'
    >
      <Header />

      <WearersList />

      <GuildRoles hatRoles={hatRoles} />

      <DetailList title='Responsibilities' details={responsibilities} />
      <DetailList title='Authorities' details={authorities} />

      <Stack spacing={4}>
        {(selectedHat.isLinked || selectedHat.levelAtLocalTree !== 0) && (
          <StatusCard
            status={MODULE_TYPES.eligibility}
            isAContract={isEligibilityAContract}
            label='Do I meet the requirements to wear this Hat?'
          />
        )}
        <ModuleDetails type={MODULE_TYPES.eligibility} />
        {!_.isEmpty(eligibility?.criteria) && (
          <DetailList
            title='Eligibility Criteria'
            details={eligibility?.criteria}
          />
        )}
      </Stack>

      {(selectedHat.isLinked || selectedHat.levelAtLocalTree !== 0) && (
        <StatusCard
          status={MODULE_TYPES.toggle}
          isAContract={isToggleAContract}
          label='Is this hat active?'
        />
      )}
      {/* MODULE DETAILS */}
      {!_.isEmpty(toggle?.criteria) && (
        <DetailList title='Toggle Criteria' details={toggle?.criteria} />
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
