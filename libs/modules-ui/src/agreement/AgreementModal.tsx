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
import { lte } from 'lodash';
import { useAgreementClaim } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';

import AgreementContent from './AgreementContent';

const HatIcon = dynamic(() => import('icons').then((mod) => mod.HatIcon));

const AgreementModal = ({
  setIsReviewed,
  isOpen,
  onClose,
}: {
  setIsReviewed: Dispatch<SetStateAction<boolean>>;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const {
    moduleParameters,
    moduleDetails,
    controllerAddress,
    chainId,
    selectedHat,
  } = useEligibility();
  const queryClient = useQueryClient();
  const contentRef = useRef<HTMLDivElement>(null);

  const { agreement } = useAgreementClaim({
    moduleParameters,
    moduleDetails,
    controllerAddress,
    chainId,
    onSuccessfulSign: () => {
      setIsReviewed?.(true);
      queryClient.invalidateQueries({
        queryKey: ['hatDetails', { chainId, id: selectedHat?.id }],
      });
    },
  });

  const handleScroll = (e: any) => {
    const { scrollHeight, scrollTop, clientHeight } = e.target;
    const bottom = scrollHeight - scrollTop === clientHeight;

    if (bottom) setIsButtonEnabled(true);
  };

  const contentHeight = contentRef.current?.scrollHeight;
  const containerHeight = contentRef.current?.clientHeight;

  useEffect(() => {
    if (agreement && lte(contentHeight, containerHeight))
      setIsButtonEnabled(true);
  }, [contentHeight, containerHeight, agreement]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent height='calc(100% - 80px)' width='calc(100% - 40px)'>
        <ModalHeader>Agreement</ModalHeader>
        <ModalCloseButton />
        <ModalBody overflowY='scroll'>
          <Box onScroll={handleScroll} ref={contentRef}>
            <AgreementContent agreement={agreement} />
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme='blue'
            onClick={() => {
              setIsReviewed(true);
              onClose();
            }}
            isDisabled={!isButtonEnabled}
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

export default AgreementModal;
