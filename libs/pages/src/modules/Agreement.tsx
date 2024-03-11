import { Box, HStack, Stack } from '@chakra-ui/react';
import { useEligibility } from 'contexts';
import { useAgreementEligibility, useWearerEligibilityCheck } from 'hats-hooks';
import { useMediaStyles } from 'hooks';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useAccount } from 'wagmi';

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
  const { moduleParameters, chainId, selectedHat } = useEligibility();
  const { agreement } = useAgreementEligibility({
    moduleParameters,
  });
  const [isSigned, setIsSigned] = useState(false);
  const { address } = useAccount();

  const { data: isEligible } = useWearerEligibilityCheck({
    wearer: address,
    selectedHat,
    chainId,
  });

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
          <Box
            py={5}
            px={10}
            maxH='90%'
            overflowY='auto'
            w={{
              base: '50%',
              lg: '70%',
            }}
            backgroundColor='white'
            border='1px solid #cbcbcb'
          >
            <AgreementContent agreement={agreement} />
          </Box>
        )}

        {!isMobile && (
          <ClaimHat
            agreement={agreement}
            isSigned={isSigned || isEligible}
            setIsSigned={setIsSigned}
          />
        )}

        {isMobile && (
          <Stack spacing={4}>
            <Header />
            <Conditions
              isSigned={isSigned || isEligible}
              setIsSigned={setIsSigned}
              agreementIsLink
            />
            <BottomMenu isSigned={isSigned || isEligible} />
          </Stack>
        )}
      </HStack>
    </Layout>
  );
};

export default Agreement;
