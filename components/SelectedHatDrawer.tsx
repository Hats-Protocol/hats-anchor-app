/* eslint-disable no-shadow */
import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import {
  Box,
  Flex,
  HStack,
  Icon,
  Button,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Image,
  Stack,
  Badge,
  Heading,
  Link as ChakraLink,
  // UnorderedList,
  // ListItem,
  Divider,
} from '@chakra-ui/react';
import { FiChevronsRight } from 'react-icons/fi';
import {
  FaBan,
  FaCheck,
  FaChevronDown,
  FaCopy,
  FaDoorOpen,
  FaEllipsisV,
  FaExternalLinkAlt,
  FaLock,
  FaPowerOff,
  FaRegArrowAltCircleDown,
  FaRegArrowAltCircleLeft,
  FaRegArrowAltCircleRight,
  FaRegArrowAltCircleUp,
  FaUser,
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

import { explorerUrl, formatAddress } from '@/lib/general';
import { idToPrettyId, isAdmin, prettyIdToId, prettyIdToIp } from '@/lib/hats';
import CONFIG from '@/constants';
import useHatMakeImmutable from '@/hooks/useHatMakeImmutable';
import useToast from '@/hooks/useToast';
import useHatStatusUpdate from '@/hooks/useHatStatusUpdate';
import useHatCheckEligibility from '@/hooks/useHatCheckEligibility';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import useHatBurn from '@/hooks/useHatBurn';
import HatWearerStatusForm from '@/forms/HatWearerStatusForm';
import Modal from '@/components/Modal';
import { useOverlay } from '@/contexts/OverlayContext';
import useWearerDetails from '@/hooks/useWearerDetails';

const SelectedHatDrawer = ({
  selectedHatId,
  setSelectedHatId,
  chainId,
  hatsData,
  onClose,
}: SelectedHatDrawerProps) => {
  console.log('hatsData', hatsData);
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;
  const { address } = useAccount();
  const { data: wearer } = useWearerDetails({
    wearerAddress: address,
    chainId,
  });
  const toast = useToast();
  const [hatData, setHatData] = useState<any>({});
  const [hierarchyHatData, setHierarchyHatData] = useState<any>({});
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [activeStatus, setActiveStatus] = useState('Inactive');
  const [mutableStatus, setMutableStatus] = useState('Immutable');
  const [changeStatusWearer, setChangeStatusWearer] = useState('');
  const currentWearerHats = _.map(_.get(wearer, 'currentHats'), 'prettyId');

  useEffect(() => {
    if (selectedHatId) {
      const data = hatsData[prettyIdToId(selectedHatId)];

      if (data) {
        setHatData(data);
        const { id, status, mutable, details } = data;

        setName(
          // eslint-disable-next-line no-nested-ternary
          details?.type === '1.0'
            ? details?.data?.name
            : typeof details === 'string'
            ? details
            : prettyIdToIp(idToPrettyId(id)),
        );
        setDescription(
          details?.type === '1.0' ? details?.data?.description : '',
        );
        setActiveStatus(status ? 'Active' : 'Inactive');
        setMutableStatus(mutable ? 'Mutable' : 'Immutable');
      }

      const hierarchyData = hatsData[prettyIdToId(selectedHatId)];
      setHierarchyHatData(hierarchyData);
    }
  }, [selectedHatId, hatsData]);

  const {
    writeAsync: updateImmutability,
    isLoading: isLoadingUpdateImmutability,
  } = useHatMakeImmutable({
    hatsAddress: CONFIG.hatsAddress,
    chainId,
    hatData,
  });

  const { writeAsync: deactivateHat, isLoading: isLoadingDeactivateHat } =
    useHatStatusUpdate({
      hatsAddress: CONFIG.hatsAddress,
      chainId,
      hatId: hatData.id,
      status: 'Inactive',
    });

  const { data: isEligible, isLoading: isLoadingCheckEligibility } =
    useHatCheckEligibility({
      wearer: address || '',
      chainId,
      hatId: hatData.id,
    });

  const { writeAsync: renounceHat } = useHatBurn({
    hatsAddress: CONFIG.hatsAddress,
    chainId,
    hatId: hatData.id,
  });

  const handleRenounceHat = async () => {
    await renounceHat?.();
  };

  if (!hatData) return null;

  return (
    <Box
      w='full'
      transition='width 0.5s' // Add transition
      bg='whiteAlpha.900'
      h='100%'
      borderLeft='1px solid'
      borderColor='gray.200'
      position='fixed'
      display={selectedHatId ? 'block' : 'none'}
      right={0}
      zIndex={12}
    >
      <Box w='100%' h='100%' position='relative' zIndex={14}>
        {/* Hat Image */}
        <Image
          src='/icon.jpeg'
          alt='hat image'
          position='absolute'
          w='100px'
          h='100px'
          border='2px solid'
          borderRadius='md'
          top='110px'
          left={-81}
          zIndex={16}
        />

        {/* Top Menu */}
        <Flex
          w='100%'
          borderBottom='1px solid'
          borderColor='gray.200'
          h='75px'
          bg='whiteAlpha.900'
          align='center'
          justify='space-between'
          px={4}
          position='absolute'
          top={0}
          zIndex={16}
        >
          <Button variant='outline' onClick={onClose}>
            <HStack>
              <Icon as={FiChevronsRight} />
              <Text>Collapse</Text>
            </HStack>
          </Button>
          <HStack>
            <Menu>
              <MenuButton as={Button} variant='outline'>
                <HStack>
                  <Icon as={FaEllipsisV} />
                  <Text>More</Text>
                </HStack>
              </MenuButton>
              <MenuList gap={5}>
                <MenuItem
                  gap={2}
                  onClick={() => updateImmutability?.()}
                  isDisabled={
                    mutableStatus === 'Immutable' ||
                    !updateImmutability ||
                    isLoadingUpdateImmutability
                  }
                >
                  <FaLock />
                  Make immutable
                </MenuItem>
                <MenuItem
                  gap={2}
                  onClick={() => deactivateHat?.()}
                  isDisabled={
                    address?.toLowerCase() !== hatData?.toggle ||
                    isLoadingDeactivateHat ||
                    !hatData?.status
                  }
                >
                  <FaPowerOff />
                  Deactivate Hat
                </MenuItem>
                <MenuItem
                  gap={2}
                  onClick={() =>
                    toast.info({
                      title: isEligible ? 'Eligible' : 'Not Eligible',
                    })
                  }
                  isDisabled={isLoadingCheckEligibility}
                >
                  <FaDoorOpen />
                  Test Eligibility
                </MenuItem>
                <MenuItem
                  gap={2}
                  onClick={() => {
                    navigator.clipboard.writeText(hatData?.id);
                    toast.info({
                      title: 'Successfully copied Hat id to clipboard',
                    });
                  }}
                >
                  <FaCopy />
                  Copy Hat ID
                </MenuItem>
                <MenuItem
                  gap={2}
                  onClick={() => {
                    navigator.clipboard.writeText(CONFIG.hatsAddress);
                    toast.info({
                      title: 'Successfully copied contract id to clipboard',
                    });
                  }}
                >
                  <FaCopy />
                  Copy Contract ID
                </MenuItem>
                {/* <MenuItem gap={2}>
                  <FaDanger />
                  Report this hat
                </MenuItem> */}
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
        <Box w='100%' overflow='scroll'>
          {/* Main Details */}
          <Stack
            position='relative'
            p={10}
            spacing={10}
            pt='110px'
            overflow='auto'
            height='100%'
          >
            <Stack spacing={4}>
              <Flex align='start' justify='space-between'>
                <Stack>
                  <Text>{name}</Text>
                  <Text>{description}</Text>
                </Stack>
                <HStack>
                  <Text>Hat ID:</Text>
                  <Text color='blue.500'>
                    {prettyIdToIp(idToPrettyId(hatData?.id))}
                  </Text>
                  <Icon
                    as={FaCopy}
                    color='blue.500'
                    cursor='pointer'
                    onClick={() => {
                      navigator.clipboard.writeText(hatData?.id);
                      toast.info({
                        title: 'Successfully copied Hat id to clipboard',
                      });
                    }}
                  />
                </HStack>
              </Flex>
              <HStack>
                <Badge colorScheme='green'>My Hat</Badge>
                <Badge
                  colorScheme={mutableStatus === 'Mutable' ? 'blue' : 'red'}
                >
                  {mutableStatus}
                </Badge>
                <Badge>{activeStatus}</Badge>
                <Badge>Level {hatData?.levelAtLocalTree}</Badge>
              </HStack>
            </Stack>

            <Stack spacing={4}>
              <Flex justify='space-between'>
                <Heading
                  size='sm'
                  fontWeight='medium'
                  textTransform='uppercase'
                >
                  Hat Wearers
                </Heading>
                <Flex gap={1}>
                  <Text>{hatData?.wearers?.length}</Text>
                  <Text color='gray.400'>of {hatData?.currentSupply}</Text>
                </Flex>
              </Flex>
              {/* Wearers list */}
              {_.map(_.get(hatData, 'wearers', []), (wearer: any) => (
                <Flex
                  key={wearer.id}
                  justifyContent='space-between'
                  alignItems='center'
                  style={{
                    backgroundColor:
                      wearer.id === address ? 'green' : 'transparent', // adjust your color as necessary
                  }}
                >
                  <Flex alignItems='center' gap={2}>
                    <FaUser /> <Text>{formatAddress(_.get(wearer, 'id'))}</Text>
                  </Flex>
                  <Flex alignItems='center' gap={2}>
                    <Link href={`/wearers/${wearer.id}`}>
                      <Text color='blue.500'>View Profile</Text>
                    </Link>

                    {wearer.id === address?.toLowerCase() && (
                      <>
                        <Divider orientation='vertical' h={5} />
                        <Text
                          color='red.500'
                          onClick={handleRenounceHat}
                          cursor='pointer'
                        >
                          Renounce Hat
                        </Text>
                      </>
                    )}

                    {wearer.id !== address?.toLowerCase() &&
                      isAdmin(
                        _.get(hatData, 'prettyId'),
                        currentWearerHats,
                      ) && (
                        <>
                          <Divider orientation='vertical' h={5} />
                          <Text
                            color='red.500'
                            onClick={() => {
                              if (setModals) {
                                setModals({
                                  hatWearerStatus: true,
                                });
                              }
                              setChangeStatusWearer(wearer.id);
                            }}
                            cursor='pointer'
                          >
                            Revoke Hat
                          </Text>
                        </>
                      )}
                  </Flex>
                </Flex>
              ))}
            </Stack>

            {/* <Stack spacing={4}>
              <Heading size='sm' fontWeight='medium' textTransform='uppercase'>
                Responsibilities
              </Heading>

              <UnorderedList spacing={3}>
                <ListItem>Post a report on Github</ListItem>
                <ListItem>Moderate the Discord</ListItem>
              </UnorderedList>
            </Stack>

            <Stack>
              <Heading size='sm' fontWeight='medium' textTransform='uppercase'>
                Authorities
              </Heading>

              <UnorderedList spacing={3}>
                <ListItem>Post a report on Github</ListItem>
                <ListItem>Moderate the Discord</ListItem>
              </UnorderedList>
            </Stack> */}

            <Stack>
              <Heading size='sm' fontWeight='medium' textTransform='uppercase'>
                Eligibility
              </Heading>
              <Flex justifyContent='space-between'>
                <HStack>
                  <Text>Can I wear this hat?</Text> <FaChevronDown />
                </HStack>

                <HStack color={isEligible ? 'green.500' : 'red.500'} ml={2}>
                  <Text>{isEligible ? 'Yes' : 'No'}</Text>
                  {isEligible ? <FaCheck /> : <FaBan />}
                </HStack>
              </Flex>
            </Stack>

            <Stack>
              <Heading size='sm' fontWeight='medium' textTransform='uppercase'>
                Toggle
              </Heading>
              <Flex justifyContent='space-between'>
                <HStack>
                  <Text>Can I toggle this hat?</Text> <FaChevronDown />
                </HStack>

                <HStack
                  color={hatData?.toggle === address ? 'green.500' : 'red.500'}
                  ml={2}
                >
                  <Text>{hatData?.toggle === address ? 'Yes' : 'No'}</Text>
                  {hatData?.toggle === address ? <FaCheck /> : <FaBan />}
                </HStack>
              </Flex>
            </Stack>

            <Stack mb={10}>
              <Heading size='sm' fontWeight='medium' textTransform='uppercase'>
                Event history
              </Heading>
              <Box>
                {hatData.events?.map((event: any) => (
                  <Flex
                    key={`${event?.transactionID}-${event?.id}`}
                    align='center'
                    justify='space-between'
                    borderBottom='1px'
                    borderColor='gray.200'
                    py={2}
                  >
                    <Text>{`${formatDistanceToNow(
                      new Date(Number(event?.timestamp) * 1000),
                    )} ago`}</Text>

                    <ChakraLink
                      isExternal
                      href={`${explorerUrl(chainId)}/tx/${
                        event?.transactionID
                      }`}
                      display='block'
                    >
                      <HStack spacing={3}>
                        <Text>{event?.id?.split('-')[0]}</Text>
                        <Icon
                          as={FaExternalLinkAlt}
                          w='12px'
                          color='blue.500'
                        />
                      </HStack>
                    </ChakraLink>
                  </Flex>
                ))}
              </Box>
            </Stack>
          </Stack>
        </Box>

        {/* Bottom Menu */}
        <Box w='100%' position='absolute' bottom={0} zIndex={14}>
          <Flex
            justify='space-between'
            p={4}
            borderTop='1px solid'
            borderColor='gray.200'
          >
            {hierarchyHatData?.leftSibling ? (
              <Button
                variant='outline'
                onClick={() => setSelectedHatId(hierarchyHatData?.leftSibling)}
                gap={1}
              >
                <FaRegArrowAltCircleLeft />
                {prettyIdToIp(hierarchyHatData?.leftSibling)}
              </Button>
            ) : (
              <Box w={16} />
            )}

            <HStack>
              {hierarchyHatData?.parentId ? (
                <Button
                  variant='outline'
                  onClick={() => setSelectedHatId(hierarchyHatData?.parentId)}
                  gap={1}
                >
                  <FaRegArrowAltCircleUp />
                  {prettyIdToIp(hierarchyHatData?.parentId)}
                </Button>
              ) : (
                <Box w={16} />
              )}

              {hierarchyHatData?.firstChild ? (
                <Button
                  variant='outline'
                  onClick={() => setSelectedHatId(hierarchyHatData?.firstChild)}
                  gap={1}
                >
                  {prettyIdToIp(hierarchyHatData?.firstChild)}
                  <FaRegArrowAltCircleDown />
                </Button>
              ) : (
                <Box w={16} />
              )}
            </HStack>

            {hierarchyHatData?.rightSibling ? (
              <Button
                variant='outline'
                onClick={() => setSelectedHatId(hierarchyHatData?.rightSibling)}
                gap={1}
              >
                {prettyIdToIp(hierarchyHatData?.rightSibling)}
                <FaRegArrowAltCircleRight />
              </Button>
            ) : (
              <Box w={16} />
            )}
          </Flex>
        </Box>
      </Box>

      <Modal
        name='hatWearerStatus'
        title='Remove a Wearer by revoking their Hat token'
        localOverlay={localOverlay}
        size='3xl'
      >
        <HatWearerStatusForm
          hatData={hatData}
          chainId={chainId}
          wearer={changeStatusWearer}
          eligibility='Not Eligible'
        />
      </Modal>
    </Box>
  );
};

export default SelectedHatDrawer;

interface SelectedHatDrawerProps {
  selectedHatId?: string;
  setSelectedHatId: (id: string) => void;
  chainId: number;
  hatsData: any;
  onClose: () => void;
}
