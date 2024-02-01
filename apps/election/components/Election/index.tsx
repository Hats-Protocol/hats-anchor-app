import { Box, Stack } from '@chakra-ui/react';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { MODULE_TYPES } from 'app-constants';
import { chainsMap } from 'app-utils';
import _ from 'lodash';
import { NextSeo } from 'next-seo';

import { useEligibility } from '../../contexts/EligibilityContext';
import Layout from '../Layout';
import ModuleDetails from '../ModuleDetails';
import DetailList from './DetailList';
import Header from './Header';
import WearersList from './WearersList';

const Election = () => {
  const { chainId, selectedHat, selectedHatDetails } = useEligibility();

  if (!chainId) return null;
  const chain = chainsMap(chainId);

  let title = '';
  if (selectedHat) {
    if (selectedHatDetails) {
      title = `${selectedHatDetails.name} on ${chain.name}`;
    } else {
      title = `Hat #${hatIdDecimalToIp(BigInt(_.get(selectedHat, 'id')))} on ${
        chain.name
      }`;
    }
  }

  const { toggle, eligibility } = _.pick(selectedHatDetails, [
    'toggle',
    'eligibility',
  ]);

  return (
    <Layout hatData={selectedHat}>
      <NextSeo title={title} />
      <Box position='relative' top='76px' px={20} pt={20}>
        <Stack spacing={10} w='100%' color='blackAlpha.800'>
          <Header />
          <WearersList />

          <Stack spacing={4}>
            <ModuleDetails type={MODULE_TYPES.eligibility} />
            {!_.isEmpty(eligibility?.criteria) && (
              <DetailList
                title='Eligibility Criteria'
                details={eligibility?.criteria}
                inline
              />
            )}
          </Stack>

          {!_.isEmpty(toggle?.criteria) && (
            <DetailList
              title='Toggle Criteria'
              details={toggle?.criteria}
              inline
            />
          )}
        </Stack>
      </Box>
    </Layout>
  );
};

export default Election;
