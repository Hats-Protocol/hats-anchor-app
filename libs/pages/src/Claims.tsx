import { Flex, Spinner, Text } from '@chakra-ui/react';
import { useIsClient } from 'app-hooks';
import { useEligibility } from 'contexts';
import dynamic from 'next/dynamic';

import { Agreement, Election, KnownModule } from './modules';

const Layout = dynamic(() => import('ui').then((mod) => mod.StandaloneLayout));

const Claims = () => {
  const isClient = useIsClient();
  const { moduleDetails, isHatDetailsLoading, isModuleDetailsLoading } =
    useEligibility();

  const isElectionEligibility =
    moduleDetails?.name === 'Hats Election Eligibility';
  const isAgreementEligibility =
    moduleDetails?.name === 'Agreement Eligibility';

  if (!isClient) return null;

  if (isHatDetailsLoading || isModuleDetailsLoading) {
    return (
      <Layout title='Claims'>
        <Flex justify='center'>
          <Spinner />
        </Flex>
      </Layout>
    );
  }

  // handle specific modules found
  if (isElectionEligibility) return <Election />;
  if (isAgreementEligibility) return <Agreement />;

  // fallback for other known modules
  if (moduleDetails) return <KnownModule />;

  // fallback for unknown modules
  return (
    <Layout title='Claims'>
      <Flex justify='center'>
        <Text>No compatible module found</Text>
      </Flex>
    </Layout>
  );
};

export default Claims;
