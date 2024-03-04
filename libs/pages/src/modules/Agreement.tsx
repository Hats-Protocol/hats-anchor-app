import { Box, HStack } from '@chakra-ui/react';
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
const HatDetails = dynamic(() =>
  import('modules-ui').then((mod) => mod.HatDetails),
);
const BottomMenu = dynamic(() =>
  import('modules-ui').then((mod) => mod.BottomMenu),
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
      <HStack
        spacing={{
          base: 12,
          lg: 20,
        }}
        px={{
          base: 0,
          lg: 20,
        }}
        pt={{
          base: 0,
          lg: 120,
        }}
        h='100%'
        direction={{
          base: 'column',
          lg: 'row',
        }}
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

        {isMobile && (
          <HatDetails
            isSigned={isSigned || isEligible}
            setIsSigned={setIsSigned}
          />
        )}

        {!isMobile && <ClaimHat agreement={agreement} />}

        {isMobile && <BottomMenu isSigned={isSigned || isEligible} />}
      </HStack>
    </Layout>
  );
};

export default Agreement;
