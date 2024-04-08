import { Box, Card, CardBody, Flex, Stack } from '@chakra-ui/react';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useEligibility } from 'contexts';
import { useMediaStyles } from 'hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { NextSeo } from 'next-seo';
import { chainsMap } from 'utils';

const ProposalView = dynamic(() =>
  import('modules-ui').then((mod) => mod.ProposalView),
);
const CurrentSeason = dynamic(() =>
  import('modules-ui').then((mod) => mod.CurrentSeason),
);
const ElectionRoles = dynamic(() =>
  import('modules-ui').then((mod) => mod.ElectionRoles),
);
const UpcomingSeason = dynamic(() =>
  import('modules-ui').then((mod) => mod.UpcomingSeason),
);
const WearersList = dynamic(() =>
  import('modules-ui').then((mod) => mod.WearersList),
);
const Header = dynamic(() => import('modules-ui').then((mod) => mod.Header));
const Layout = dynamic(() => import('ui').then((mod) => mod.StandaloneLayout));

const Election = () => {
  const {
    chainId,
    selectedHat,
    selectedHatDetails,
    isHatDetailsLoading,
    isModuleDetailsLoading,
  } = useEligibility();
  const { isClient, isMobile } = useMediaStyles();

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

  // should be loaded and know if it's election eligibility
  if (!isClient || isHatDetailsLoading || isModuleDetailsLoading) return null;

  return (
    <Layout title='Claims'>
      <NextSeo title={title} />
      <Stack
        position='relative'
        px={{ base: 6, md: 10, lg: 32 }}
        py={120}
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
              {!isMobile && (
                <Card display={{ base: 'none', md: 'inherit' }}>
                  <CardBody>
                    <UpcomingSeason />
                  </CardBody>
                </Card>
              )}
              <Card>
                <CardBody>
                  <ProposalView />
                </CardBody>
              </Card>
            </Stack>
          </Box>
        </Flex>
        {isMobile && (
          <>
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
          </>
        )}
      </Stack>
    </Layout>
  );
};

export default Election;
