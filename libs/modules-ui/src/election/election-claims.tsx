'use client';

import { Card, CardBody, Flex, Skeleton, Stack } from '@chakra-ui/react';
import { useEligibility } from 'contexts';
import { useMediaStyles } from 'hooks';

import { CurrentSeason } from './current-season';
import { ElectionRoles } from './election-roles';
import { ProposalView } from './proposal-view';
import { UpcomingSeason } from './upcoming-season';
import { WearersList } from './wearers-list';

export const ElectionClaims = () => {
  const {
    chainId,
    // selectedHat,
    // selectedHatDetails,
    isEligibilityRulesLoading,
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
  if (!isClient || isEligibilityRulesLoading)
    return <Skeleton w='full' minH='500px' borderRadius='lg' />;

  return (
    <Stack gap={10}>
      <Flex gap={6} w='full'>
        <Skeleton
          w={{ base: '100%', md: '48%' }}
          minH='90px'
          isLoaded={!isEligibilityRulesLoading}
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
          isLoaded={!isEligibilityRulesLoading}
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
          isLoaded={!isEligibilityRulesLoading}
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
          isLoaded={!isEligibilityRulesLoading}
        >
          <Card display={{ base: 'none', md: 'inherit' }} w='full' h='full'>
            <CardBody>
              <ElectionRoles />
            </CardBody>
          </Card>
        </Skeleton>
      </Flex>

      <Skeleton w='full' minH='300px' isLoaded={!isEligibilityRulesLoading}>
        <Card w='full' h='full'>
          <CardBody>
            <ProposalView />
          </CardBody>
        </Card>
      </Skeleton>

      {isMobile && (
        <>
          <Skeleton w='full' minH='300px' isLoaded={!isEligibilityRulesLoading}>
            <Card w='full' h='full'>
              <CardBody>
                <UpcomingSeason />
              </CardBody>
            </Card>
          </Skeleton>

          <Skeleton w='full' minH='300px' isLoaded={!isEligibilityRulesLoading}>
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
