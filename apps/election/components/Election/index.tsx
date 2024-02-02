import { Box, Card, Grid, GridItem, Stack } from '@chakra-ui/react';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { MODULE_TYPES } from 'app-constants';
import { chainsMap } from 'app-utils';
import _ from 'lodash';
import { NextSeo } from 'next-seo';

import { useEligibility } from '../../contexts/EligibilityContext';
import Layout from '../Layout';
import CurrentSeason from './CurrentSeason';
import ElectionRoles from './ElectionRoles';
import Header from './Header';
import UpcomingSeason from './UpcomingSeason';
import WearersList from './WearersList';

const Election = () => {
  const { chainId, selectedHat, moduleDetails, selectedHatDetails } =
    useEligibility();
  console.log('moduleDetails', moduleDetails);

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

  return (
    <Layout hatData={selectedHat}>
      <NextSeo title={title} />
      <Stack position='relative' top='76px' px={20} pt={20} gap={10}>
        <Header />
        <Grid templateColumns={['repeat(1, 1fr)', 'repeat(2, 1fr)']} gap={6}>
          <Stack gap={6}>
            <Card p={5}>
              <CurrentSeason />
            </Card>
            <Card p={5}>
              <WearersList />
            </Card>
            <Card p={5}>
              <ElectionRoles />
            </Card>
          </Stack>
          <Stack gap={6}>
            <Card p={5}>
              <UpcomingSeason />
            </Card>
            <Card p={5}>Snapshot</Card>
          </Stack>
        </Grid>
      </Stack>
    </Layout>
  );
};

export default Election;
