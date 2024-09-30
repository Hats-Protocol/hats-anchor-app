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
import { useMediaStyles } from 'hooks';
import { Dispatch, SetStateAction } from 'react';
import { BsCheckSquareFill, BsXOctagonFill } from 'react-icons/bs';

import { AgreementContentModal } from './agreement-content-modal';

export const Conditions = ({
  isReviewed,
  setIsReviewed,
  agreementIsLink,
}: {
  isReviewed: boolean;
  setIsReviewed: Dispatch<SetStateAction<boolean>>;
  agreementIsLink?: boolean;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const allConditionsMet = isReviewed;
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
            <Box>Comply with all Rules to claim this Hat</Box>
            <AccordionIcon />
            {/* {isSignAgreementLoading ? (
              <Spinner size='sm' color='blue.500' />
            ) : ( */}
            <Icon
              as={isReviewed ? BsCheckSquareFill : BsXOctagonFill}
              color={allConditionsMet ? 'green.500' : 'red.500'}
            />
            {/* )} */}
          </AccordionButton>
          <AccordionPanel>
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
                as={isReviewed ? BsCheckSquareFill : BsXOctagonFill}
                color={isReviewed ? 'green.500' : 'red.500'}
              />
              {/* )} */}
            </HStack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

      <AgreementContentModal
        setIsReviewed={setIsReviewed}
        isOpen={isOpen}
        onClose={onClose}
      />
    </Box>
  );
};
