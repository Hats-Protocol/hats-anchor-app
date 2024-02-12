import {
  Box,
  Card,
  CardBody,
  Flex,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useIsClient } from 'app-hooks';
import { chainsMap } from 'app-utils';
import { useEligibility } from 'contexts';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { NextSeo } from 'next-seo';

const ProposalView = dynamic(() =>
  import('ui').then((mod) => mod.ProposalView),
);
const CurrentSeason = dynamic(() =>
  import('ui').then((mod) => mod.CurrentSeason),
);
const ElectionRoles = dynamic(() =>
  import('ui').then((mod) => mod.ElectionRoles),
);
const UpcomingSeason = dynamic(() =>
  import('ui').then((mod) => mod.UpcomingSeason),
);
const WearersList = dynamic(() => import('ui').then((mod) => mod.WearersList));
const Header = dynamic(() => import('ui').then((mod) => mod.Header));
const Layout = dynamic(() => import('ui').then((mod) => mod.StandaloneLayout));

const Election = () => {
  const isClient = useIsClient();
  const {
    chainId,
    selectedHat,
    selectedHatDetails,
    moduleDetails,
    isHatDetailsLoading,
    isModuleDetailsLoading,
  } = useEligibility();
  const isElectionEligibility =
    moduleDetails?.name === 'Hats Election Eligibility';

  if (!chainId) return null;
  const chain = chainsMap(chainId);

  let title = '';
  if (selectedHat && selectedHatDetails) {
    title = `${selectedHatDetails.name} on ${chain.name}`;
  } else if (selectedHat) {
    title = `Hat #${hatIdDecimalToIp(BigInt(_.get(selectedHat, 'id')))} on ${
      chain.name
    }`;
  }

  if (!isClient) return null;

  if (isHatDetailsLoading || isModuleDetailsLoading) {
    <Layout title='Claims'>
      <Flex justifyContent='center'>
        <Spinner />
      </Flex>
    </Layout>;
  }

  if (!isElectionEligibility) {
    <Layout title='Claims'>
      <Flex justify='center'>
        <Text>No compatible module found</Text>
      </Flex>
    </Layout>;
  }

  return (
    <Layout title='Claims'>
      <NextSeo title={title} />
      <Stack
        position='relative'
        top='76px'
        px={{ base: 6, md: 32 }}
        py={10}
        gap={10}
      >
        <Flex maxW='100%' justifyContent='center'>
          <Header />
        </Flex>
        <Flex gap={6} direction={{ base: 'column', md: 'row' }}>
          <Box flexBasis={{ base: '100%', md: '35%' }}>
            <Stack gap={6}>
              <Card>
                <CardBody>
                  <CurrentSeason />
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <WearersList />
                </CardBody>
              </Card>
              <Card display={{ base: 'none', md: 'inherit' }}>
                <CardBody>
                  <ElectionRoles />
                </CardBody>
              </Card>
            </Stack>
          </Box>
          <Box flexBasis={['100%', '65%']}>
            <Stack gap={6}>
              <Card display={{ base: 'none', md: 'inherit' }}>
                <CardBody>
                  <UpcomingSeason />
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <ProposalView />
                </CardBody>
              </Card>
            </Stack>
          </Box>
        </Flex>
        <Card display={{ base: 'inherit', md: 'none' }}>
          <CardBody>
            <UpcomingSeason />
          </CardBody>
        </Card>
        <Card display={{ base: 'inherit', md: 'none' }}>
          <CardBody>
            <ElectionRoles />
          </CardBody>
        </Card>
      </Stack>
    </Layout>
  );
};

export default Election;
