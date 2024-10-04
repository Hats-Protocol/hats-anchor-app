'use client';

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
  useDisclosure,
} from '@chakra-ui/react';
import { useEligibility } from 'contexts';
import { useMediaStyles } from 'hooks';
// import { Dispatch, SetStateAction } from 'react';
import { BsCheckSquareFill, BsXOctagonFill } from 'react-icons/bs';

import { AgreementContentModal } from './agreement-content-modal';

export const Conditions = () => {
  const agreementIsLink = true;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isEligible: isReadyToClaim } = useEligibility();
  const allConditionsMet = isReadyToClaim;
  const { isMobile } = useMediaStyles();

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

      <Accordion allowMultiple defaultIndex={[0]}>
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
            <Box textAlign='left'>Comply with all Rules to claim this Hat</Box>
            <AccordionIcon />
            {/* {isSignAgreementLoading ? (
              <Spinner size='sm' color='blue.500' />
            ) : ( */}
            <Icon
              as={isReadyToClaim ? BsCheckSquareFill : BsXOctagonFill}
              color={allConditionsMet ? 'green.500' : 'red.500'}
            />
            {/* )} */}
          </AccordionButton>
          <AccordionPanel bg='gray.50'>
            <HStack w='full' justifyContent='space-between'>
              <Box>
                Sign the{' '}
                {agreementIsLink ? (
                  <Button onClick={onOpen} colorScheme='blue' variant='link'>
                    Agreement
                  </Button>
                ) : (
                  'Agreement'
                )}
              </Box>
              {/* {isSignAgreementLoading ? (
                <Spinner size='sm' color='blue.500' />
              ) : ( */}
              <Icon
                as={isReadyToClaim ? BsCheckSquareFill : BsXOctagonFill}
                color={isReadyToClaim ? 'green.500' : 'red.500'}
              />
              {/* )} */}
            </HStack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

      <AgreementContentModal isOpen={isOpen} onClose={onClose} />
    </Box>
  );
};
