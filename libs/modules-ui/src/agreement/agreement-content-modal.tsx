'use client';

import {
  Box,
  Button,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import { CONFIG } from '@hatsprotocol/constants';
import { useQuery } from '@tanstack/react-query';
import { useEligibility, useOverlay } from 'contexts';
import { get } from 'lodash';
import { useAgreementClaim } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { fetchIpfs } from 'utils';

const HatIcon = dynamic(() => import('icons').then((mod) => mod.HatIcon));
const AgreementContent = dynamic(() =>
  import('molecules').then((mod) => mod.AgreementContent),
);

const handleFetchIpfs: any = async (ipfsHash: string) => {
  return fetchIpfs(ipfsHash)
    .then((res: any) => {
      return get(res, 'data', null);
    })
    .catch((err: Error) => {
      console.error(err);
      return null;
    });
};

export const AgreementContentModal = () => {
  const { moduleParameters } = useEligibility();
  const { modals, setModals } = useOverlay();

  const { agreement } = useAgreementClaim({
    moduleParameters,
  });

  const { data: agreementV0 } = useQuery({
    queryKey: ['agreementV0'],
    queryFn: () => handleFetchIpfs(CONFIG.agreementV0.ipfsHash),
    enabled: !agreement,
  });

  const handleDownload = () => {
    console.log('download');

    // TODO download agreement
  };

  return (
    <Modal
      isOpen={!!modals?.agreementManagerClaims}
      onClose={() => setModals?.({})}
    >
      <ModalOverlay />
      <ModalContent height='calc(100% - 80px)' width='calc(100% - 40px)'>
        <ModalHeader>Agreement</ModalHeader>
        <ModalCloseButton />
        <ModalBody overflowY='scroll'>
          <Box>
            <AgreementContent agreement={agreement || agreementV0} />
          </Box>
        </ModalBody>
        <ModalFooter gap={4} justifyContent='space-between'>
          <Button variant='link' color='blue.500' onClick={handleDownload}>
            Download agreement
          </Button>

          <Button
            colorScheme='blue'
            onClick={() => setModals?.({})}
            leftIcon={<Icon as={HatIcon} color='white' />}
          >
            Reviewed
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
