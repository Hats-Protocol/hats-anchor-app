import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Heading,
  HStack,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
} from '@chakra-ui/react';
import { useEligibility } from 'contexts';
import { useAgreementEligibility } from 'hats-hooks';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { BsCheckSquareFill, BsXOctagonFill } from 'react-icons/bs';

import AgreementContent from './AgreementContent';

const HatIcon = dynamic(() => import('ui').then((mod) => mod.HatIcon));

const Conditions = ({
  isSigned,
  setIsSigned,
}: {
  isSigned: boolean;
  setIsSigned: (val: boolean) => void;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const { moduleParameters, moduleDetails, chainId } = useEligibility();
  const allConditionsMet = isSigned;

  const { agreement, signAgreement, isSignAgreementLoading } =
    useAgreementEligibility({
      moduleParameters,
      moduleDetails,
      chainId,
      onSuccessfulSign: () => {
        setIsSigned(true);
      },
    });

  const handleScroll = (e) => {
    const bottom =
      e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (bottom) setIsButtonEnabled(true);
  };

  return (
    <Box w='100%'>
      <Heading size='sm'>Conditions to wear this Hat</Heading>

      {/* for some reason adding another empty accordion enables collapsing the second one 
      removing it makes the second one not collapsible - something weird is going on with chakra's accordion */}
      <Accordion />
      <Accordion defaultIndex={[0]} allowMultiple>
        <AccordionItem borderWidth={0} borderColor='transparent'>
          <AccordionButton w='full' justifyContent='space-between' px={0}>
            <Box>Comply with all Rules to claim this Hat</Box>
            <AccordionIcon />
            {isSignAgreementLoading ? (
              <Spinner size='sm' color='blue.500' />
            ) : (
              <Icon
                as={isSigned ? BsCheckSquareFill : BsXOctagonFill}
                color={allConditionsMet ? 'green.500' : 'red.500'}
              />
            )}
          </AccordionButton>
          <AccordionPanel pb={4} px={0}>
            <HStack w='full' justifyContent='space-between'>
              <Box>
                Sign the{' '}
                <Button onClick={onOpen} colorScheme='blue' variant='link'>
                  Agreement
                </Button>
              </Box>
              {isSignAgreementLoading ? (
                <Spinner size='sm' color='blue.500' />
              ) : (
                <Icon
                  as={isSigned ? BsCheckSquareFill : BsXOctagonFill}
                  color={isSigned ? 'green.500' : 'red.500'}
                />
              )}
            </HStack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

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
              onClick={() => {
                signAgreement();
                onClose();
              }}
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
  );
};

export default Conditions;
