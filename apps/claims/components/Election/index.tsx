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
import { chainsMap } from 'app-utils';
import _ from 'lodash';
import { NextSeo } from 'next-seo';
import { Layout } from 'ui';

import { useEligibility } from '../../contexts/EligibilityContext';
import CurrentSeason from './CurrentSeason';
import ElectionRoles from './ElectionRoles';
import Header from './Header';
import ProposalDetails from './ProposalDetails';
import UpcomingSeason from './UpcomingSeason';
import WearersList from './WearersList';

const Election = () => {
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

  return (
    <Layout hatData={selectedHat}>
      <NextSeo title={title} />
      <Stack position='relative' top='76px' px={32} py={20} gap={10}>
        {isHatDetailsLoading ? (
          <Flex justifyContent='center'>
            <Spinner />
          </Flex>
        ) : (
          <>
            <Flex w='full' justifyContent='center' mb={10}>
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
                        <ProposalDetails />
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
