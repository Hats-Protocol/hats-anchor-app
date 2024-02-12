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
} from '@chakra-ui/react';
import { CONFIG, initialControls } from '@hatsprotocol/constants';
import { useIsClient } from 'app-hooks';
import { chainsMap, explorerUrl } from 'app-utils';
import { useOverlay, useTreeForm } from 'contexts';
import { formatDistanceToNow } from 'date-fns';
import { Controls } from 'hats-types';
import _ from 'lodash';
import React, { useEffect } from 'react';
import { AiOutlineDoubleLeft } from 'react-icons/ai';
import { BsPencil, BsToggle2Off, BsToggles } from 'react-icons/bs';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';
import { IoCloseCircleOutline } from 'react-icons/io5';

import { ChakraNextLink } from '../atoms';
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
    // storedData,
    // setStoredData,
  } = useTreeForm();
  const { onOpen, onClose, isOpen } = useDisclosure();
  const { onOpen: onOpenTreeDrawer } = _.pick(treeDisclosure, ['onOpen']);
  const [localLastTimestamp, setLocalLastTimestamp] = React.useState<string>();
  const isClient = useIsClient();

  // const updatedHats = !_.isEmpty(
  //   _.filter(storedData, (h) => !_.isEmpty(_.reject(_.keys(h), ['id']))),
  // );

  useEffect(() => {
    if (!isClient) return;
    setLocalLastTimestamp(
      `${
        _.get(_.first(treeEvents), 'timestamp') &&
        formatDistanceToNow(
          new Date(Number(_.get(_.first(treeEvents), 'timestamp')) * 1000),
        )
      } ago`,
    );
  }, [treeEvents, isClient]);

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
        <HStack>
          <Button
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
                leftIcon={<Icon as={BsToggles} />}
                isDisabled={editMode}
                variant='filled'
                rightIcon={isOpen ? <FaChevronUp /> : <FaChevronDown />}
                fontWeight='medium'
                colorScheme={isOpen ? 'blue.500' : '#2D3748'}
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
        </HStack>
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
          <HStack spacing={4}>
            {/* {!_.isEmpty(treeToDisplay) && (
              <Stack minH='55px' spacing={1}>
                <Text color='blue.500'>
                  <b>{_.size(treeToDisplay) || 0}</b> hat
                  {_.size(treeToDisplay) > 1 ? 's' : ''} in this {CONFIG.tree}
                </Text>
                {updatedHats && (
                  <Button
                    variant='outlineMatch'
                    colorScheme='blue.500'
                    onClick={() => setStoredData?.([])}
                    size='xs'
                  >
                    Clear Updates
                  </Button>
                )}
              </Stack>
            )} */}

            <Stack align='center' alignItems='flex-end' spacing={1}>
              <Skeleton isLoaded={!!chain && !!treeToDisplay}>
                <Flex align='center' mr={-1.5} gap={1} fontSize='sm'>
                  <Text>{`${CONFIG.appName} ${CONFIG.protocolVersion}:`}</Text>

                  <ChakraNextLink
                    href={`${explorerUrl(chainId)}/address/${
                      CONFIG.hatsAddress
                    }`}
                    isExternal
                  >
                    <HStack spacing={1}>
                      <Text variant='medium'>{chain?.name}</Text>
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
              <Skeleton isLoaded={isClient && !!localLastTimestamp}>
                <Popover trigger='hover'>
                  <PopoverTrigger>
                    <Flex align='center' gap={1} fontSize='sm' cursor='pointer'>
                      <Text>Last event: </Text>
                      <Text mr={2} variant='medium'>
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
                            variant='medium'
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
            </Stack>
          </HStack>
        )}
      </Flex>
    </Flex>
  );
};

export default TreeMenu;
