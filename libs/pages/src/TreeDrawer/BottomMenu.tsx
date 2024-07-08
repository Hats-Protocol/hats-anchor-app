'use client';

import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Input,
  Spinner,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { CONFIG } from '@hatsprotocol/constants';
import { useTreeForm } from 'contexts';
import { useMulticallCallData } from 'hats-hooks';
import { editHasUpdates } from 'hats-utils';
import { useClipboard, useToast } from 'hooks';
import posthog from 'posthog-js';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { FiCopy } from 'react-icons/fi';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';

// TODO use ui/Input component

const BottomMenu = ({
  isExpanded,
  setAccordionIndex,
}: {
  isExpanded: boolean;
  setAccordionIndex: (index: number[]) => void;
}) => {
  const { storedData, chainId, treeId, onchainHats, treeToDisplay } =
    useTreeForm();
  const { data, isLoading } = useMulticallCallData({
    chainId,
    treeId,
    storedData,
    onchainHats,
    treeToDisplay,
    isExpanded,
  });
  const callData = data ? data?.callData : null;
  const toast = useToast();

  const hasUpdates = editHasUpdates(storedData);

  const { onCopy: copyCallData } = useClipboard(callData || '');
  const { onCopy: copyContractAddress } = useClipboard(CONFIG.hatsAddress);

  const openCalldataMenu = () => {
    posthog.capture('Opened Transaction Calldata Menu');
    setAccordionIndex(isExpanded ? [] : [0]);
  };

  return (
    <Box w='100%' position='absolute' bottom={0} zIndex={14}>
      <Flex
        justify='space-between'
        borderTop='1px solid'
        borderColor='gray.200'
        bg='cyan.50'
      >
        <Accordion allowToggle w='full' mt='-1px' index={isExpanded ? [0] : []}>
          <AccordionItem isDisabled={!hasUpdates}>
            <AccordionButton px={8} py={4} onClick={openCalldataMenu}>
              <Box flex='1' textAlign='left'>
                Transaction Call Data
              </Box>
              <Icon as={isExpanded ? IoIosArrowDown : IoIosArrowUp} />
            </AccordionButton>

            <AccordionPanel pb={8} px={8}>
              <Stack>
                <Text variant='light'>Hats contract address</Text>
                <HStack spacing={4}>
                  <Input
                    value={CONFIG.hatsAddress}
                    background='white'
                    color='blackAlpha.600'
                    isReadOnly
                    placeholder='Loading...'
                  />
                  <Button
                    leftIcon={<FiCopy />}
                    onClick={() => {
                      copyContractAddress();
                      toast.info({
                        title:
                          'Successfully copied contract address to clipboard',
                      });
                    }}
                    variant='outline'
                    borderColor='gray.300'
                  >
                    Copy
                  </Button>
                </HStack>
                <HStack>
                  <Text variant='light'>
                    Transaction call data (hex encoded)
                  </Text>
                  <Tooltip
                    label='To deploy these changes from a multisig or DAO, create a new transaction using a transaction builder, switch to raw/custom data, and copy this into the "Data (Hex encoded)" field.'
                    hasArrow
                  >
                    <Box h={5}>
                      <Icon as={AiOutlineInfoCircle} color='blackAlpha.700' />
                    </Box>
                  </Tooltip>
                </HStack>

                {!isLoading ? (
                  <HStack spacing={4}>
                    <Input
                      value={isLoading ? '' : callData || ''}
                      background='white'
                      color='blackAlpha.600'
                      isReadOnly
                      placeholder='Loading...'
                    />
                    <Button
                      leftIcon={<FiCopy />}
                      onClick={() => {
                        copyCallData();
                        toast.info({
                          title: 'Successfully copied hex code to clipboard',
                        });
                      }}
                      isDisabled={!callData}
                      variant='outline'
                      borderColor='gray.300'
                    >
                      Copy
                    </Button>
                  </HStack>
                ) : (
                  <Flex justify='center' align='center'>
                    <Spinner />
                  </Flex>
                )}
              </Stack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Flex>
    </Box>
  );
};

export default BottomMenu;
