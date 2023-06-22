/* eslint-disable no-shadow */
import React from 'react';
import _ from 'lodash';
import {
  Box,
  Flex,
  HStack,
  Icon,
  Text,
  Stack,
  Badge,
  Heading,
  Link as ChakraLink,
  // UnorderedList,
  // ListItem,
  Divider,
} from '@chakra-ui/react';
import {
  FaBan,
  FaCheck,
  FaChevronDown,
  FaCopy,
  FaExternalLinkAlt,
  FaUser,
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

import { explorerUrl, formatAddress } from '@/lib/general';
import { idToPrettyId, isAdmin, prettyIdToIp } from '@/lib/hats';
import CONFIG from '@/constants';
import useToast from '@/hooks/useToast';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import useHatBurn from '@/hooks/useHatBurn';
import { useOverlay } from '@/contexts/OverlayContext';
import useWearerDetails from '@/hooks/useWearerDetails';

const MainContent = ({
  chainId,
  hatData,
  isEligible,
  name,
  description,
  mutableStatus,
  activeStatus,
  setChangeStatusWearer,
}: MainContentProps) => {
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;
  const { address } = useAccount();
  const { data: wearer } = useWearerDetails({
    wearerAddress: address,
    chainId,
  });
  const toast = useToast();
  const currentWearerHats = _.map(_.get(wearer, 'currentHats'), 'prettyId');

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
            <Badge colorScheme={mutableStatus === 'Mutable' ? 'blue' : 'red'}>
              {mutableStatus}
            </Badge>
            <Badge>{activeStatus}</Badge>
            <Badge>Level {hatData?.levelAtLocalTree}</Badge>
          </HStack>
        </Stack>

        <Stack spacing={4}>
          <Flex justify='space-between'>
            <Heading size='sm' fontWeight='medium' textTransform='uppercase'>
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
                  isAdmin(_.get(hatData, 'prettyId'), currentWearerHats) && (
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
                  href={`${explorerUrl(chainId)}/tx/${event?.transactionID}`}
                  display='block'
                >
                  <HStack spacing={3}>
                    <Text>{event?.id?.split('-')[0]}</Text>
                    <Icon as={FaExternalLinkAlt} w='12px' color='blue.500' />
                  </HStack>
                </ChakraLink>
              </Flex>
            ))}
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
};

export default MainContent;

interface MainContentProps {
  chainId: number;
  hatData: any;
  isEligible: boolean;
  name: string;
  description: string;
  mutableStatus: string;
  activeStatus: string;
  setChangeStatusWearer: any;
}
