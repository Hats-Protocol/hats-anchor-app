import { Heading, Stack } from '@chakra-ui/react';
import { MODULE_TYPES } from '@hatsprotocol/constants';
import { checkAddressIsContract } from 'app-utils';
import { useTreeForm } from 'contexts';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Hex } from 'viem';

import WearersList from '../WearersList';
import AuthoritiesList from './AuthoritiesList';
import DetailList from './DetailList';
import Header from './Header';
import LinkRequests from './LinkRequests';
import ResponsibilitiesList from './ResponsibilitiesList';
import StatusCard from './Status';

const EventHistory = dynamic(() =>
  import('ui').then((mod) => mod.EventHistory),
);
const ModuleDetails = dynamic(() =>
  import('ui').then((mod) => mod.ModuleDetails),
);

const MainContent = () => {
  const { chainId, selectedHat, selectedHatDetails } = useTreeForm();
  const [isEligibilityAContract, setIsEligibilityAContract] = useState(false);
  const [isToggleAContract, setIsToggleAContract] = useState(false);

  const { toggle, eligibility } = _.pick(selectedHatDetails, [
    'toggle',
    'eligibility',
  ]);

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
      p={10}
      spacing={10}
      w='100%'
      overflow='scroll'
      height='calc(100% - 150px)'
      pb={400}
      pos='relative'
      color='blackAlpha.800'
    >
      <Header />
      <WearersList />
      <ResponsibilitiesList />
      <AuthoritiesList />

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
            inline
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
        <DetailList title='Toggle Criteria' details={toggle?.criteria} inline />
      )}

      <LinkRequests />

      <Stack spacing={1}>
        <Heading size='sm' variant='medium' textTransform='uppercase'>
          Event history
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
