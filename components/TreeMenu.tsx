import {
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Image,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Radio,
  RadioGroup,
  Skeleton,
  Stack,
  Text,
  useDisclosure,
  UseDisclosureReturn,
  VStack,
} from '@chakra-ui/react';
import { formatDistanceToNow } from 'date-fns';
import _ from 'lodash';
import React, { useEffect } from 'react';
import { AiOutlineDoubleLeft } from 'react-icons/ai';
import { BsPencil, BsToggle2Off, BsToggles } from 'react-icons/bs';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';
import { IoCloseCircleOutline } from 'react-icons/io5';

import CONFIG, { initialControls } from '@/constants';
import { useOverlay } from '@/contexts/OverlayContext';
import { useTreeForm } from '@/contexts/TreeFormContext';
import { chainsMap, explorerUrl } from '@/lib/web3';
import { Controls } from '@/types';

import ChakraNextLink from './atoms/ChakraNextLink';
import EventHistory from './EventHistory';

const TreeMenu = ({
  treeDisclosure,
}: {
  treeDisclosure: UseDisclosureReturn | undefined;
}) => {
  const { setModals } = useOverlay();
  const {
    chainId,
    treeToDisplay,
    treeEvents,
    editMode,
    setSelectedOption,
    selectedOption,
    showInactiveHats,
    setShowInactiveHats,
    toggleEditMode,
  } = useTreeForm();
  const { onOpen, onClose, isOpen } = useDisclosure();
  const { onOpen: onOpenTreeDrawer } = _.pick(treeDisclosure, ['onOpen']);
  const [localLastTimestamp, setLocalLastTimestamp] = React.useState<string>();

  useEffect(() => {
    setLocalLastTimestamp(
      `${
        _.get(_.first(treeEvents), 'timestamp') &&
        formatDistanceToNow(
          new Date(Number(_.get(_.first(treeEvents), 'timestamp')) * 1000),
        )
      } ago`,
    );
  }, [treeEvents]);

  if (!chainId) return null;
  const chain = chainsMap(chainId);

  // const controls = checkPermissionsResponsibilities(
  //   treeToDisplay,
  //   initialControls,
  // );

  return (
    <Flex
      bg='whiteAlpha.700'
      align='center'
      justify='space-between'
      px={3}
      mb={5}
      position='absolute'
      top='75px'
      height='70px'
      w='100%'
      zIndex={4}
    >
      <Flex justify='space-between' align='center' w='100%'>
        <Box>
          <Button
            mr={3}
            fontWeight='medium'
            border='1px solid #0987A0'
            background='#C4F1F9'
            color='#065666'
            leftIcon={
              editMode ? (
                <Icon as={IoCloseCircleOutline} />
              ) : (
                <Icon as={BsPencil} color='#065666' />
              )
            }
            isDisabled={!treeToDisplay}
            onClick={toggleEditMode}
          >
            {editMode ? 'Leave Edit Mode' : 'Edit Tree'}
          </Button>
          {/* <Button colorScheme="teal" mr={3}>
                Table View
              </Button> */}
          <Popover isOpen={isOpen} onOpen={onOpen} onClose={onClose} matchWidth>
            <PopoverTrigger>
              <Button
                leftIcon={
                  <Icon
                    as={BsToggles}
                    color={isOpen ? 'blue.500' : '#2D3748'}
                  />
                }
                isDisabled={editMode}
                variant='filled'
                rightIcon={isOpen ? <FaChevronUp /> : <FaChevronDown />}
                fontWeight='medium'
                color={isOpen ? 'blue.500' : '#2D3748'}
                borderColor={isOpen ? 'blue.500' : '#2D3748'}
              >
                View Controls
              </Button>
            </PopoverTrigger>
            <PopoverContent w='250px'>
              <PopoverArrow />
              <PopoverBody p={6}>
                <RadioGroup
                  onChange={setSelectedOption}
                  value={selectedOption}
                  w='100%'
                >
                  <Stack direction='column' spacing={3}>
                    {initialControls.map((control: Controls) => (
                      <Radio value={control.value} key={control.value}>
                        <HStack>
                          {control.icon}
                          <Text>{control.label}</Text>
                        </HStack>
                      </Radio>
                    ))}
                  </Stack>
                </RadioGroup>
                <Divider my={4} />
                <Checkbox
                  isChecked={showInactiveHats}
                  onChange={(e) => setShowInactiveHats?.(e.target.checked)}
                >
                  <HStack>
                    <Icon as={BsToggle2Off} w={4} h={4} color='gray.500' />
                    <Text>Inactive Hats</Text>
                  </HStack>
                </Checkbox>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </Box>
        {editMode ? (
          <Button
            variant='outline'
            bg='whiteAlpha.900'
            borderColor='gray.700'
            leftIcon={<Icon as={AiOutlineDoubleLeft} />}
            onClick={onOpenTreeDrawer}
          >
            Draft Changes List
          </Button>
        ) : (
          <VStack align='center' alignItems='flex-end' spacing={1}>
            <Skeleton isLoaded={!!chain && !!treeToDisplay}>
              <Flex align='center' mr={-1.5} gap={1} fontSize='sm'>
                <Text>{`${CONFIG.appName} ${CONFIG.protocolVersion}:`}</Text>

                <ChakraNextLink
                  href={`${explorerUrl(chainId)}/address/${CONFIG.hatsAddress}`}
                  isExternal
                >
                  <HStack spacing={1}>
                    <Text fontWeight='medium'>{chain?.name}</Text>
                    <IconButton
                      aria-label='Explorer contract address'
                      icon={<Icon as={FiExternalLink} />}
                      size='xs'
                      variant='ghost'
                    />
                  </HStack>
                </ChakraNextLink>
              </Flex>
            </Skeleton>
            <Skeleton isLoaded={!!localLastTimestamp}>
              <Popover trigger='hover'>
                <PopoverTrigger>
                  <Flex align='center' gap={1} fontSize='sm' cursor='pointer'>
                    <Text>Last event: </Text>
                    <Text mr={2} fontWeight='medium'>
                      {localLastTimestamp}
                    </Text>
                    <Image src='/icons/ago.svg' alt='History icon' />
                  </Flex>
                </PopoverTrigger>
                <PopoverContent width='400px' mr={4}>
                  <PopoverArrow />
                  <PopoverCloseButton />
                  <PopoverBody>
                    <Stack>
                      <Box>
                        <Heading
                          size='sm'
                          fontWeight='medium'
                          textTransform='uppercase'
                          mb={1}
                        >
                          Event history
                        </Heading>
                        <EventHistory type='tree' count={6} />
                        {_.gt(_.size(treeEvents), 4) && (
                          <>
                            <Divider my={2} />
                            <Button
                              onClick={() => setModals?.({ events: true })}
                              variant='link'
                              colorScheme='blue'
                            >
                              View Full History
                            </Button>
                          </>
                        )}
                      </Box>
                    </Stack>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            </Skeleton>
          </VStack>
        )}
      </Flex>
    </Flex>
  );
};

export default TreeMenu;
