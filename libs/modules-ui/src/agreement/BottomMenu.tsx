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
import { useEligibility } from 'contexts';
import { useHatClaimBy, useWearerDetails } from 'hats-hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { useAccount, useChainId } from 'wagmi';

const HatIcon = dynamic(() => import('ui').then((mod) => mod.HatIcon));

const BottomMenu = ({ isSigned }: { isSigned: boolean }) => {
  const currentNetworkId = useChainId();
  const { selectedHat, chainId } = useEligibility();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { address } = useAccount();

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

  return (
    <Box w='100%' position='fixed' bottom={0} zIndex={14} bg='whiteAlpha.900'>
      <Flex p={2} borderTop='1px solid' borderColor='gray.200'>
        <Button
          colorScheme='blue'
          isDisabled={
            !claimHat ||
            !hatterIsAdmin ||
            chainId !== currentNetworkId ||
            isWearing ||
            !isClaimable ||
            !isSigned
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
          <ModalHeader>Claiming your hat</ModalHeader>
          <ModalCloseButton />
          <ModalBody overflowY='scroll'>Claiming</ModalBody>
          <ModalFooter>
            <Button
              colorScheme='blue'
              onClick={claimHat}
              leftIcon={<Icon as={HatIcon} color='white' />}
              w='full'
            >
              Sign and Claim this Hat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default BottomMenu;
