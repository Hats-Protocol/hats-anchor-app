/* eslint-disable no-nested-ternary */
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

  return (
    <Layout title='Claims'>
      <NextSeo title={title} />
      <Stack position='relative' top='76px' px={32} py={10} gap={10}>
        {isHatDetailsLoading ? (
          <Flex justifyContent='center'>
            <Spinner />
          </Flex>
        ) : (
          <>
            <Flex w='full' justifyContent='center'>
              <Header />
            </Flex>
            {isModuleDetailsLoading ? (
              <Flex justifyContent='center'>
                <Spinner />
              </Flex>
            ) : isElectionEligibility ? (
              <Flex gap={6}>
                <Box flexBasis={['100%', '35%']}>
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
                    <Card p={6}>
                      <ElectionRoles />
                    </Card>
                  </Stack>
                </Box>
                <Box flexBasis={['100%', '65%']}>
                  <Stack gap={6}>
                    <Card>
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
            ) : (
              <Flex justify='center'>
                <Text>No compatible module found</Text>
              </Flex>
            )}
          </>
        )}
      </Stack>
    </Layout>
  );
};

export default Election;
