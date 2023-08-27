import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
  HStack,
  Input,
  Spinner,
  Text,
  useClipboard,
} from '@chakra-ui/react';
import { useState } from 'react';
import { FiCopy } from 'react-icons/fi';

import { useTreeForm } from '@/contexts/TreeFormContext';
import useMulticallCallData from '@/hooks/useMulticallCallData';
import useToast from '@/hooks/useToast';
import { editHasUpdates } from '@/lib/hats';

const BottomMenu = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { storedData } = useTreeForm();
  const { data, isLoading } = useMulticallCallData({
    isExpanded,
  });
  const callData = data ? data?.callData : null;
  const toast = useToast();

  const hasUpdates = editHasUpdates(storedData);

  const { onCopy: copyCallData } = useClipboard(callData || '');

  return (
    <Box w='100%' position='absolute' bottom={0} zIndex={14}>
      <Flex
        justify='space-between'
        borderTop='1px solid'
        borderColor='gray.200'
        bg='cyan.50'
      >
        <Accordion allowToggle w='full' mt='-1px'>
          <AccordionItem isDisabled={!hasUpdates}>
            {({ isExpanded: localIsExpanded }) => {
              setIsExpanded(localIsExpanded);

              return (
                <>
                  <AccordionButton px={8} py={4}>
                    <Box flex='1' textAlign='left'>
                      Executable hex code
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>

                  <AccordionPanel pb={8} px={8}>
                    <Box>
                      <Text mb={2} color='blackAlpha.700'>
                        Copy this into the Data field of a transaction builder
                        to deploy the tree from a contract (such as a multisig
                        or DAO).
                      </Text>

                      {!isLoading ? (
                        <HStack>
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
                                title:
                                  'Successfully copied hex code to clipboard',
                              });
                            }}
                            ml={2}
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
                    </Box>
                  </AccordionPanel>
                </>
              );
            }}
          </AccordionItem>
        </Accordion>
      </Flex>
    </Box>
  );
};

export default BottomMenu;
