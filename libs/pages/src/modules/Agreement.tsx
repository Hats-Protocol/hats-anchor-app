import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Stack,
  VStack,
} from '@chakra-ui/react';
import { useEligibility } from 'contexts';
import { useAgreementEligibility } from 'hats-hooks';
import { useMediaStyles } from 'hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { useAccount } from 'wagmi';

const HatIcon = dynamic(() => import('icons').then((mod) => mod.HatIcon));

const Layout = dynamic(() => import('ui').then((mod) => mod.StandaloneLayout));
const ClaimHat = dynamic(() =>
  import('modules-ui').then((mod) => mod.ClaimHat),
);
const AgreementContent = dynamic(() =>
  import('modules-ui').then((mod) => mod.AgreementContent),
);
const BottomMenu = dynamic(() =>
  import('modules-ui').then((mod) => mod.BottomMenu),
);
const Header = dynamic(() => import('modules-ui').then((mod) => mod.Header));
const Conditions = dynamic(() =>
  import('modules-ui').then((mod) => mod.Conditions),
);

const Agreement = () => {
  const { isMobile } = useMediaStyles();
  const { moduleParameters, selectedHat } = useEligibility();
  const { agreement } = useAgreementEligibility({
    moduleParameters,
  });
  const { address } = useAccount();
  const [isReviewed, setIsReviewed] = useState(false);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const isWearing = useMemo(
    () => _.includes(_.map(selectedHat?.wearers, 'id'), _.toLower(address)),
    [selectedHat, address],
  );

  const handleScroll = (e) => {
    const bottom =
      Math.floor(e.target.scrollHeight - e.target.scrollTop) ===
      e.target.clientHeight;
    if (bottom) setIsButtonEnabled(true);
  };

  return (
    <Layout title='Claims'>
      {!isMobile && (
        <Stack pt='80px' alignItems='center' mb={6}>
          <Header />
        </Stack>
      )}

      <HStack
        spacing={{
          base: 12,
          lg: 20,
        }}
        px={{
          base: 0,
          lg: 20,
        }}
        h={isMobile ? '100vh' : 'calc(100vh - 232px)'}
        background={
          isMobile
            ? 'linear-gradient(180deg, #FFF 0%, #FFF 60.01%, #EBF8FF 100%) !important'
            : 'none'
        }
        direction={{
          base: 'column',
          lg: 'row',
        }}
        position='relative'
        alignItems='flex-start'
      >
        {!isMobile && (
          <VStack spacing={4} align='stretch' maxH='90%' w='70%'>
            <Box
              py={5}
              px={10}
              flex='1'
              overflowY='auto'
              backgroundColor='white'
              border='1px solid #cbcbcb'
              onScroll={handleScroll}
            >
              <AgreementContent agreement={agreement} />
            </Box>
            <Flex justifyContent='center'>
              <Button
                colorScheme='blue'
                onClick={() => {
                  setIsReviewed(true);
                }}
                isDisabled={!isButtonEnabled}
                leftIcon={<Icon as={HatIcon} color='white' />}
                py={4}
              >
                Reviewed
              </Button>
            </Flex>
          </VStack>
        )}

        {!isMobile && (
          <ClaimHat
            agreement={agreement}
            isReviewed={isReviewed}
            setIsReviewed={setIsReviewed}
          />
        )}

        {isMobile && (
          <Stack spacing={4}>
            <Header />
            <Conditions
              isReviewed={isReviewed || isWearing}
              setIsReviewed={setIsReviewed}
              agreementIsLink
            />
            <BottomMenu isReviewed={isReviewed || isWearing} />
          </Stack>
        )}
      </HStack>
    </Layout>
  );
};

export default Agreement;
