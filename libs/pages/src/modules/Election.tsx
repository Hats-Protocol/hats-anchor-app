'use client';

import { Card, CardBody, Flex, Skeleton, Stack } from '@chakra-ui/react';
// import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useEligibility } from 'contexts';
import { useMediaStyles } from 'hooks';
// import _ from 'lodash';
import dynamic from 'next/dynamic';
// import { NextSeo } from 'next-seo';
// import { chainsMap } from 'utils';

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

const Election = () => {
  const {
    chainId,
    // selectedHat,
    // selectedHatDetails,
    isModuleDetailsLoading,
  } = useEligibility();
  const { isClient, isMobile } = useMediaStyles();

  if (!chainId) return null;
  // const chain = chainsMap(chainId);

  // let title = '';
  // if (selectedHat && selectedHatDetails) {
  //   title = `${selectedHatDetails.name} on ${chain.name}`;
  // } else if (selectedHat) {
  //   title = `Hat #${hatIdDecimalToIp(BigInt(_.get(selectedHat, 'id')))} on ${
  //     chain.name
  //   }`;
  // }

  // should be loaded and know if it's election eligibility
  if (!isClient || isModuleDetailsLoading)
    return <Skeleton w='full' minH='500px' borderRadius='lg' />;

  return (
    <Stack gap={10}>
      <Flex gap={6} w='full'>
        <Skeleton
          w={{ base: '100%', md: '48%' }}
          minH='90px'
          isLoaded={!isModuleDetailsLoading}
        >
          <Card w='full' h='full'>
            <CardBody>
              <CurrentSeason />
            </CardBody>
          </Card>
        </Skeleton>

        <Skeleton
          w={{ base: '100%', md: '48%' }}
          display={{ base: 'none', md: 'inherit' }}
          minH='90px'
          isLoaded={!isModuleDetailsLoading}
        >
          <Card w='full' h='full'>
            <CardBody>
              <UpcomingSeason />
            </CardBody>
          </Card>
        </Skeleton>
      </Flex>

      <Flex gap={6} w='full'>
        <Skeleton
          w={{ base: '100%', md: '48%' }}
          minH='90px'
          isLoaded={!isModuleDetailsLoading}
        >
          <Card w='full' h='full'>
            <CardBody>
              <WearersList />
            </CardBody>
          </Card>
        </Skeleton>

        <Skeleton
          w={{ base: '100%', md: '48%' }}
          minH='90px'
          isLoaded={!isModuleDetailsLoading}
        >
          <Card display={{ base: 'none', md: 'inherit' }} w='full' h='full'>
            <CardBody>
              <ElectionRoles />
            </CardBody>
          </Card>
        </Skeleton>
      </Flex>

      <Skeleton w='full' minH='300px' isLoaded={!isModuleDetailsLoading}>
        <Card w='full' h='full'>
          <CardBody>
            <ProposalView />
          </CardBody>
        </Card>
      </Skeleton>

      {isMobile && (
        <>
          <Skeleton w='full' minH='300px' isLoaded={!isModuleDetailsLoading}>
            <Card w='full' h='full'>
              <CardBody>
                <UpcomingSeason />
              </CardBody>
            </Card>
          </Skeleton>

          <Skeleton w='full' minH='300px' isLoaded={!isModuleDetailsLoading}>
            <Card display={{ base: 'inherit', md: 'none' }} w='full' h='full'>
              <CardBody>
                <ElectionRoles />
              </CardBody>
            </Card>
          </Skeleton>
        </>
      )}
    </Stack>
  );
};

export default Election;
