import {
  Box,
  Button,
  Flex,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { CONFIG } from '@hatsprotocol/constants';
import { useEligibility } from 'contexts';
import { useHatClaimBy, useWearerDetails } from 'hats-hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { fetchIpfs } from 'utils';
import { useAccount, useChainId } from 'wagmi';

import AgreementContent from './AgreementContent';

const HatIcon = dynamic(() => import('ui').then((mod) => mod.HatIcon));

const BottomMenu = () => {
  const currentNetworkId = useChainId();
  const { selectedHat, chainId } = useEligibility();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { address } = useAccount();
  const [agreement, setAgreement] = useState('');
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);

  const { claimHat, hatterIsAdmin, isClaimable } = useHatClaimBy({
    selectedHat,
    chainId,
    wearer: address,
  });
  const { data: wearer } = useWearerDetails({
    wearerAddress: address,
    chainId,
  });
  const isWearing = _.includes(_.map(wearer, 'id'), selectedHat?.id);

  useEffect(() => {
    const fetchIPFS = async () => {
      // get the module ipfs details
      const res = await fetchIpfs(CONFIG.agreementV0.ipfsHash);
      if (res) {
        setAgreement(res.data);
      }
    };

    fetchIPFS();
  }, []);

  const handleScroll = (e) => {
    const bottom =
      e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (bottom) setIsButtonEnabled(true);
  };

  return (
    isClaimable &&
    !isWearing && (
      <Box w='100%' position='fixed' bottom={0} zIndex={14} bg='whiteAlpha.900'>
        <Flex p={2} borderTop='1px solid' borderColor='gray.200'>
          <Button
            colorScheme='blue'
            isDisabled={
              !claimHat || !hatterIsAdmin || chainId !== currentNetworkId
            }
            onClick={onOpen}
            leftIcon={<Icon as={HatIcon} color='white' />}
          >
            Claim this Hat
          </Button>
        </Flex>

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent height='calc(100% - 80px)' width='calc(100% - 40px)'>
            <ModalHeader>Agreement</ModalHeader>
            <ModalCloseButton />
            <ModalBody onScroll={handleScroll} overflowY='scroll'>
              <AgreementContent agreement={agreement} />
            </ModalBody>
            <ModalFooter>
              <Button
                colorScheme='blue'
                onClick={claimHat}
                isDisabled={!isButtonEnabled}
                leftIcon={<Icon as={HatIcon} color='white' />}
                w='full'
              >
                Sign and Claim this Hat
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    )
  );
};

export default BottomMenu;
