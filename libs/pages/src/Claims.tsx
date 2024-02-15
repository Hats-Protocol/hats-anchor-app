import { Flex, Heading, Spinner, Stack, Text } from '@chakra-ui/react';
import { CONFIG } from '@hatsprotocol/constants';
import { hatIdDecimalToIp, hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { useIsClient } from 'app-hooks';
import { chainsMap } from 'app-utils';
import { useEligibility } from 'contexts';
import dynamic from 'next/dynamic';

import { Agreement, AgreementV0, Election, KnownModule } from './modules';

const Layout = dynamic(() => import('ui').then((mod) => mod.StandaloneLayout));
const ChakraNextLink = dynamic(() =>
  import('ui').then((mod) => mod.ChakraNextLink),
);
const Header = dynamic(() => import('modules-ui').then((mod) => mod.Header));

const Claims = () => {
  const isClient = useIsClient();
  const {
    chainId,
    selectedHat,
    moduleDetails,
    isHatDetailsLoading,
    isModuleDetailsLoading,
  } = useEligibility();

  const isElectionEligibility =
    moduleDetails?.name === 'Hats Election Eligibility';
  const isAgreementEligibility =
    moduleDetails?.name === 'Agreement Eligibility';

  if (!isClient) return null;

  if (isHatDetailsLoading || isModuleDetailsLoading) {
    return (
      <Layout title='Claims'>
        <Flex justify='center' pt='120px'>
          <Stack minW='350px' align='center' spacing={50}>
            <Header />
            <Spinner size='xl' />
          </Stack>
        </Flex>
      </Layout>
    );
  }

  if (chainId === 10 && selectedHat?.id === CONFIG.communityHatId) {
    return <AgreementV0 />;
  }

  // handle specific modules found
  if (isElectionEligibility) return <Election />;
  if (isAgreementEligibility) return <Agreement />;

  // fallback for other known modules
  if (moduleDetails) return <KnownModule />;

  // fallback for unknown modules
  return (
    <Layout title='Claims'>
      <Flex justify='center' pt='120px'>
        <Stack align='center' minW='350px' spacing={150}>
          <Header />
          <Stack w='100%' align='center' spacing={10}>
            <Heading size='xl'>No compatible module found</Heading>
            <Text>
              No compatible module found for hat{' '}
              <ChakraNextLink
                href={`${CONFIG.APP_URL}/trees/${chainId}/${hatIdToTreeId(
                  BigInt(selectedHat?.id),
                )}?hatId=${hatIdDecimalToIp(BigInt(selectedHat?.id))}`}
                decoration
              >
                #{hatIdDecimalToIp(BigInt(selectedHat?.id))}
              </ChakraNextLink>{' '}
              on {chainsMap(chainId)?.name}
            </Text>
          </Stack>
        </Stack>
      </Flex>
    </Layout>
  );
};

export default Claims;
