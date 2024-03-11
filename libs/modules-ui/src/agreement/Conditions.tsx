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
import { useMediaStyles } from 'hooks';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { BsCheckSquareFill, BsXOctagonFill } from 'react-icons/bs';
import { useQueryClient } from 'wagmi';

import AgreementContent from './AgreementContent';

const HatIcon = dynamic(() => import('icons').then((mod) => mod.HatIcon));

const Conditions = ({
  isSigned,
  setIsSigned,
  agreementIsLink,
}: {
  isSigned: boolean;
  setIsSigned: (val: boolean) => void;
  agreementIsLink?: boolean;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const {
    moduleParameters,
    moduleDetails,
    controllerAddress,
    chainId,
    selectedHat,
  } = useEligibility();
  const allConditionsMet = isSigned;
  const { isMobile } = useMediaStyles();
  const queryClient = useQueryClient();

  const { agreement, isSignAgreementLoading } = useAgreementEligibility({
    moduleParameters,
    moduleDetails,
    controllerAddress,
    chainId,
    onSuccessfulSign: () => {
      setIsSigned?.(true);
      queryClient.invalidateQueries([
        'hatDetails',
        { chainId, id: selectedHat?.id },
      ]);
    },
  });

  const handleScroll = (e) => {
    const bottom =
      e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (bottom) setIsButtonEnabled(true);
  };

  return (
    <Box
      w='100%'
      pb={{
        base: 100,
        md: 4,
      }}
    >
      <Heading size='sm' my={1} px={4}>
        Conditions to wear this Hat
      </Heading>

      <Accordion allowMultiple>
        <AccordionItem borderWidth={0} borderColor='transparent'>
          <AccordionButton
            w='full'
            justifyContent='space-between'
            background={
              isMobile
                ? 'linear-gradient(180deg, #FFF 0%, #FFF 60.01%, #EBF8FF 100%) !important'
                : 'none'
            }
            borderBottom='1px solid var(--gray-500, #718096)'
          >
            <Box fontSize='sm'>Comply with all Rules to claim this Hat</Box>
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
          <AccordionPanel>
            <HStack w='full' justifyContent='space-between'>
              <Box fontSize='sm'>
                Sign the{' '}
                {agreementIsLink ? (
                  <Button
                    onClick={onOpen}
                    colorScheme='blue'
                    variant='link'
                    fontSize='sm'
                  >
                    Agreement
                  </Button>
                ) : (
                  'Agreement'
                )}
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
                setIsSigned(true);
                onClose();
              }}
              isDisabled={!isButtonEnabled}
              leftIcon={<Icon as={HatIcon} color='white' />}
              w='full'
            >
              Sign the Agreement
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Conditions;
