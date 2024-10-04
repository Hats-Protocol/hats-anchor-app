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
import { useQueryClient } from '@tanstack/react-query';
import { useEligibility } from 'contexts';
import { useAgreementClaim } from 'modules-hooks';
import dynamic from 'next/dynamic';

import AgreementContent from './agreement-content';

const HatIcon = dynamic(() => import('icons').then((mod) => mod.HatIcon));

export const AgreementContentModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { moduleParameters, moduleDetails, controllerAddress, chainId } =
    useEligibility();
  const queryClient = useQueryClient();

  const { agreement } = useAgreementClaim({
    moduleParameters,
    moduleDetails,
    controllerAddress,
    chainId,
    onSuccessfulSign: () => {
      queryClient.invalidateQueries({ queryKey: ['hatDetails'] });
      queryClient.invalidateQueries({ queryKey: ['wearerDetails'] });
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent height='calc(100% - 80px)' width='calc(100% - 40px)'>
        <ModalHeader>Agreement</ModalHeader>
        <ModalCloseButton />
        <ModalBody overflowY='scroll'>
          <Box>
            <AgreementContent agreement={agreement} />
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme='blue'
            onClick={() => onClose()}
            leftIcon={<Icon as={HatIcon} color='white' />}
            w='full'
          >
            Reviewed
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
