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
  FaLock,
  FaPowerOff,
  FaUser,
} from 'react-icons/fa';
import { formatAddress } from '@/lib/general';
import { idToPrettyId, prettyIdToId, prettyIdToIp } from '@/lib/hats';
import CONFIG from '@/constants';
import useHatMakeImmutable from '@/hooks/useHatMakeImmutable';
import useToast from '@/hooks/useToast';
import useHatStatusUpdate from '@/hooks/useHatStatusUpdate';
import useHatCheckEligibility from '@/hooks/useHatCheckEligibility';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import useHatBurn from '@/hooks/useHatBurn';

const SelectedHatShade = ({
  selectedHatId,
  chainId,
  hatsData,
  onClose,
}: SelectedHatShadeProps) => {
  const { address } = useAccount();
  const toast = useToast();
  const [hatData, setHatData] = useState<any>({});
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [activeStatus, setActiveStatus] = useState('Inactive');
  const [mutableStatus, setMutableStatus] = useState('Immutable');

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
          <Stack position='relative' p={10} spacing={10} pt='110px'>
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
                      <Divider orientation='vertical' h={5} />
                    )}

                    {wearer.id === address?.toLowerCase() && (
                      <Text
                        color='red.500'
                        onClick={handleRenounceHat}
                        cursor='pointer'
                      >
                        Renounce
                      </Text>
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
            <Button variant='outline'>2.2</Button>
            <HStack>
              <Button variant='outline'>2</Button>
              <Button variant='outline'>2.3.1</Button>
            </HStack>

            <Button variant='outline'>2.4</Button>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};

export default SelectedHatShade;

interface SelectedHatShadeProps {
  selectedHatId?: string;
  chainId: number;
  hatsData: any;
  onClose: () => void;
}
