import { Box, Card, Flex, Grid, Stack } from '@chakra-ui/react';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
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

  return (
    <Layout hatData={selectedHat}>
      <NextSeo title={title} />
      <Stack position='relative' top='76px' px={32} pt={20} gap={10}>
        <Flex w='full' justifyContent='center' mb={10}>
          <Header />
        </Flex>
        <Flex gap={6}>
          <Box flexBasis={['100%', '35%']}>
            <Stack gap={6}>
              <Card p={6}>
                <CurrentSeason />
              </Card>
              <Card p={6}>
                <WearersList />
              </Card>
              <Card p={6}>
                <ElectionRoles />
              </Card>
            </Stack>
          </Box>
          <Box flexBasis={['100%', '65%']}>
            <Stack gap={6}>
              <Card p={6}>
                <UpcomingSeason />
              </Card>
              <Card p={6}>Snapshot</Card>
            </Stack>
          </Box>
        </Flex>
      </Stack>
    </Layout>
  );
};

export default Election;
