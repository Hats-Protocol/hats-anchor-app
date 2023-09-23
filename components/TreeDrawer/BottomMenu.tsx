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
  useClipboard,
} from '@chakra-ui/react';
import { FiCopy } from 'react-icons/fi';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';

import CONFIG from '@/constants';
import { useTreeForm } from '@/contexts/TreeFormContext';
import useMulticallCallData from '@/hooks/useMulticallCallData';
import useToast from '@/hooks/useToast';
import { editHasUpdates } from '@/lib/hats';

const BottomMenu = ({
  isExpanded,
  setAccordionIndex,
}: {
  isExpanded: boolean;
  setAccordionIndex: (index: number[]) => void;
}) => {
  const { storedData } = useTreeForm();
  const { data, isLoading } = useMulticallCallData({
    isExpanded,
  });
  const callData = data ? data?.callData : null;
  const toast = useToast();

  const hasUpdates = editHasUpdates(storedData);

  const { onCopy: copyCallData } = useClipboard(callData || '');
  const { onCopy: copyContractAddress } = useClipboard(CONFIG.hatsAddress);

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
            <AccordionButton
              px={8}
              py={4}
              onClick={() => setAccordionIndex(isExpanded ? [] : [0])}
            >
              <Box flex='1' textAlign='left'>
                Transaction Call Data
              </Box>
              <Icon as={isExpanded ? IoIosArrowDown : IoIosArrowUp} />
            </AccordionButton>

            <AccordionPanel pb={8} px={8}>
              <Stack>
                <Text color='blackAlpha.700'>Hats contract address</Text>
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
                <Text color='blackAlpha.700'>
                  Copy this into the Data field of a transaction builder to
                  deploy the tree from a contract (such as a multisig or DAO).
                </Text>

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
