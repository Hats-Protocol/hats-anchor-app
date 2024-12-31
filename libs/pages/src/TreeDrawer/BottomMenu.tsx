'use client';

import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  HStack,
  Icon,
  Input,
  Spinner,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { CONFIG } from '@hatsprotocol/constants';
import { hatIdDecimalToIp, hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { useTreeForm } from 'contexts';
import { useMulticallCallData } from 'hats-hooks';
import { editHasUpdates } from 'hats-utils';
import { useClipboard, useSimulateTransaction } from 'hooks';
import { get, map } from 'lodash';
import dynamic from 'next/dynamic';
import posthog from 'posthog-js';
import { useCallback } from 'react';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { FiCopy } from 'react-icons/fi';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { useAccount } from 'wagmi';

const ChakraNextLink = dynamic(() => import('ui').then((mod) => mod.ChakraNextLink));

// TODO use ui/Input component
const TENDERLY_SIMULATION_URL = 'https://www.tdly.co/shared/simulation/';

const BottomMenu = ({
  isExpanded,
  setAccordionIndex,
}: {
  isExpanded: boolean;
  setAccordionIndex: (index: number[]) => void;
}) => {
  const { storedData, chainId, treeId, onchainHats, treeToDisplay, topHat } = useTreeForm();
  const { address } = useAccount();
  const { data: multicallData, isLoading } = useMulticallCallData({
    chainId,
    treeId,
    storedData,
    onchainHats,
    treeToDisplay,
    isExpanded,
  });
  const callData = get(multicallData, 'callData.callData', null);
  const allCalls = get(multicallData, 'allCalls', []);
  const topHatWearer = get(topHat, 'wearers.0.id');

  const hasUpdates = editHasUpdates(storedData);

  const { onCopy: copyCallData } = useClipboard(callData || '', {
    toastData: { title: 'Successfully copied hex code to clipboard' },
  });
  const { onCopy: copyContractAddress } = useClipboard(CONFIG.hatsAddress, {
    toastData: {
      title: 'Successfully copied contract address to clipboard',
      status: 'info',
    },
  });
  const { handleSimulate, isSimulating, simulationResponse } = useSimulateTransaction({
    chainId,
    callData: callData || undefined,
  });

  const openCalldataMenu = () => {
    posthog.capture('Opened Transaction Calldata Menu');
    setAccordionIndex(isExpanded ? [] : [0]);
  };

  const enableSimulation = posthog.isFeatureEnabled('simulation') || process.env.NODE_ENV === 'development';

  const handleSimulateTopHat = useCallback(() => {
    if (!topHatWearer) return;
    handleSimulate(topHatWearer);
  }, [handleSimulate, topHatWearer]);

  const handleSimulateMe = useCallback(() => {
    if (!address) return;

    handleSimulate(address);
  }, [handleSimulate, address]);

  const isDev = process.env.NODE_ENV === 'development' || posthog.isFeatureEnabled('dev');

  // console.log(simulationResponse);

  return (
    <Box w='100%' position='absolute' bottom={0} zIndex={14}>
      <Flex justify='space-between' borderTop='1px solid' borderColor='gray.200' bg='cyan.50'>
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
                {isDev && (
                  <>
                    <Stack maxH={400} overflow='auto'>
                      <Heading size='sm' variant='medium'>
                        Combined Call Data
                      </Heading>

                      {map(allCalls, (hat: { hatId: string; calls: { functionName: string }[] }) => {
                        return (
                          <Stack spacing={1}>
                            <Heading size='sm'>{hatIdDecimalToIp(hatIdHexToDecimal(hat.hatId))}</Heading>
                            {map(hat.calls, (call) => (
                              <Text fontSize='sm'>-- {call.functionName}</Text>
                            ))}
                          </Stack>
                        );
                      })}
                    </Stack>

                    <Divider borderColor='gray.500' />
                  </>
                )}

                {enableSimulation && (
                  <>
                    <Stack spacing={1} my={2}>
                      <Text variant='light'>Simulate transaction</Text>

                      <Flex gap={2}>
                        <Button
                          size='sm'
                          variant='outlineMatch'
                          colorScheme='blue.500'
                          isDisabled={!callData}
                          isLoading={isSimulating}
                          onClick={handleSimulateMe}
                        >
                          Simulate Me
                        </Button>

                        <Button
                          size='sm'
                          variant='outlineMatch'
                          colorScheme='blue.500'
                          isDisabled={!callData}
                          isLoading={isSimulating}
                          onClick={handleSimulateTopHat}
                        >
                          Simulate Top Hat
                        </Button>

                        {simulationResponse && (
                          <HStack>
                            <Text size='sm'>
                              {get(simulationResponse, 'transaction.status')
                                ? 'Simulation successful!'
                                : 'Simulation failed!'}
                            </Text>

                            <ChakraNextLink
                              href={TENDERLY_SIMULATION_URL + get(simulationResponse, 'simulation.id')}
                              decoration
                              isExternal
                            >
                              <Text size='sm'>View on Tenderly</Text>
                            </ChakraNextLink>
                          </HStack>
                        )}
                      </Flex>
                    </Stack>

                    <Divider borderColor='gray.500' />
                  </>
                )}

                <Stack spacing={1}>
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
                      onClick={copyContractAddress}
                      variant='outline'
                      borderColor='gray.300'
                    >
                      Copy
                    </Button>
                  </HStack>
                </Stack>

                <Stack spacing={1}>
                  <HStack>
                    <Text variant='light'>Transaction call data (hex encoded)</Text>
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
                        onClick={copyCallData}
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
              </Stack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Flex>
    </Box>
  );
};

export default BottomMenu;
