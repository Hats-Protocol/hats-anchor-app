'use client';

import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  Stack,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react';
import { useEligibility } from 'contexts';
import { useMediaStyles } from 'hooks';
import  { includes, lte, map, toLower, toNumber } from 'lodash';
import { useAgreementClaim } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import { hatLink } from 'utils';
import { useAccount } from 'wagmi';

const HatIcon = dynamic(() => import('icons').then((mod) => mod.HatIcon));

const Layout = dynamic(() =>
  import('molecules').then((mod) => mod.StandaloneLayout),
);
const ChakraNextLink = dynamic(() =>
  import('ui').then((mod) => mod.ChakraNextLink),
);
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
  const { moduleParameters, selectedHat, chainId } = useEligibility();
  const { agreement } = useAgreementClaim({
    moduleParameters,
  });
  const { address } = useAccount();
  const [isReviewed, setIsReviewed] = useState(false);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const isWearing = useMemo(
    () => includes(map(selectedHat?.wearers, 'id'), toLower(address)),
    [selectedHat, address],
  );
  const hasSupply = useMemo(
    () =>
      toNumber(selectedHat?.maxSupply) -
        toNumber(selectedHat?.currentSupply) >
      0,
    [selectedHat],
  );

  const handleScroll = (e: any) => {
    const bottom =
      Math.floor(e.target.scrollHeight - e.target.scrollTop) >
      e.target.clientHeight * 0.9;
    if (bottom) setIsButtonEnabled(true);
  };

  useEffect(() => {
    const contentHeight = contentRef.current?.scrollHeight;
    const containerHeight = contentRef.current?.clientHeight;
    if (lte(contentHeight, containerHeight)) {
      setIsButtonEnabled(true);
    }
  }, [agreement]);

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
        h={{ base: 'auto', md: 'calc(100vh - 232px)' }}
        minH={{ base: '100%', md: 'none' }}
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
          <>
            <VStack spacing={4} align='stretch' maxH='90%' w='70%'>
              <Box
                py={5}
                px={10}
                flex='1'
                overflowY='auto'
                backgroundColor='white'
                border='1px solid #cbcbcb'
                onScroll={handleScroll}
                ref={contentRef}
              >
                <AgreementContent agreement={agreement} />
              </Box>
              <Flex justifyContent='center'>
                <Tooltip
                  label={
                    !hasSupply &&
                    'No hats left to claim. If this hat is mutable an admin could increase the supply.'
                  }
                  placement='top'
                >
                  <Button
                    colorScheme='blue'
                    onClick={() => {
                      setIsReviewed(true);
                    }}
                    isDisabled={!isButtonEnabled || !hasSupply}
                    leftIcon={<Icon as={HatIcon} color='white' />}
                    py={4}
                  >
                    Reviewed
                  </Button>
                </Tooltip>
              </Flex>
            </VStack>

            <ClaimHat
              agreement={agreement}
              isReviewed={isReviewed}
              setIsReviewed={setIsReviewed}
              hasSupply={hasSupply}
            />
          </>
        )}

        {isMobile && (
          <Stack spacing={4} minH='800px'>
            <Header />
            {hasSupply ? (
              <Conditions
                isReviewed={isReviewed || isWearing}
                setIsReviewed={setIsReviewed}
                agreementIsLink
              />
            ) : (
              <Stack align='center' spacing={8} mb={100}>
                <Heading size='md'>This hat has no remaining supply!</Heading>

                {selectedHat?.mutable && (
                  <Text maxW='80%' textAlign='center'>
                    Since this hat is mutable, an admin can adjust the max
                    supply.
                  </Text>
                )}

                <ChakraNextLink
                  href={hatLink({ chainId, hatId: selectedHat?.id })}
                  isExternal
                >
                  <Button variant='outlineMatch' colorScheme='blue.500'>
                    View Hat
                  </Button>
                </ChakraNextLink>
              </Stack>
            )}

            <BottomMenu isReviewed={isReviewed || isWearing} />
          </Stack>
        )}
      </HStack>
    </Layout>
  );
};

export default Agreement;
