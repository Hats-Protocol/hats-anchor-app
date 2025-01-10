'use client';

import { Box, Button, Flex, Heading, Icon } from '@chakra-ui/react';
import { CONFIG } from '@hatsprotocol/constants';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal, useOverlay } from 'contexts';
import { get } from 'lodash';
import { useAgreementClaim } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { ModuleDetails, SupportedChains } from 'types';
import { fetchIpfs } from 'utils';

const HatIcon = dynamic(() => import('icons').then((mod) => mod.HatIcon));
const AgreementContent = dynamic(() => import('molecules').then((mod) => mod.AgreementContent));

const handleFetchIpfs = async (ipfsHash: string) => {
  return fetchIpfs(ipfsHash)
    .then((res: unknown) => {
      return get(res, 'data', null);
    })
    .catch((err: Error) => {
      // eslint-disable-next-line no-console
      console.error(err);
      return null;
    });
};

export const AgreementContentModal = ({
  moduleDetails,
  chainId,
  onlyModule = false,
}: {
  moduleDetails: ModuleDetails;
  chainId: SupportedChains;
  onlyModule?: boolean;
}) => {
  const { setModals } = useOverlay();
  const queryClient = useQueryClient();
  const { agreement, signAgreement } = useAgreementClaim({
    moduleDetails,
    moduleParameters: moduleDetails?.liveParameters,
    chainId,
    onSuccessfulSign: () => {
      queryClient.invalidateQueries({ queryKey: ['currentEligibility'] });
      setModals?.({});
    },
  });

  const { data: agreementV0 } = useQuery({
    queryKey: ['agreementV0'],
    queryFn: () => handleFetchIpfs(CONFIG.agreementV0.ipfsHash),
    enabled: !agreement,
  });

  // const handleDownload = () => {
  //   console.log('download');

  //   // TODO download agreement
  // };

  const handleReviewed = () => {
    if (onlyModule) {
      setModals?.({});
    } else {
      signAgreement();
    }

    // TODO reviewed agreement
  };

  return (
    <Modal name={`${moduleDetails?.instanceAddress}-agreementManagerClaims`}>
      <Flex flexDirection='column' gap={4}>
        <Flex>
          <Heading>Sign the Agreement</Heading>
        </Flex>
        <Box overflowY='scroll' maxHeight='70vh'>
          <Box>
            <AgreementContent agreement={agreement || agreementV0} />
          </Box>
        </Box>
        <Flex gap={4} justifyContent='end'>
          {/* <Button
            variant='link'
            color='blue.500'
            onClick={handleDownload}
            isDisabled={!agreement}
          >
            Download agreement
          </Button> */}

          <Button colorScheme='blue' onClick={handleReviewed} leftIcon={<Icon as={HatIcon} color='white' />}>
            {onlyModule ? 'Reviewed' : 'Sign Agreement'}
          </Button>
        </Flex>
      </Flex>
    </Modal>
  );
};
