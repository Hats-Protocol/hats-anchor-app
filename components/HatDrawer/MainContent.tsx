import React from 'react';
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
  UnorderedList,
  ListItem,
} from '@chakra-ui/react';
import {
  FaBan,
  FaCheck,
  FaChevronDown,
  FaCopy,
  FaExternalLinkAlt,
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

import { explorerUrl } from '@/lib/general';
import { prettyIdToIp } from '@/lib/hats';
import useToast from '@/hooks/useToast';
import { useAccount } from 'wagmi';
import { Responsibility } from '@/forms/ResponsibilityDetailsForm';
import { Authority } from '@/forms/AuthorityDetailsForm';

import WearersList from './WearersList';

const MainContent = ({
  chainId,
  hatData,
  isEligible,
  name,
  description,
  hatRoles,
  mutableStatus,
  activeStatus,
  setModals,
  localOverlay,
  isAdminUser,
  responsibilities,
  authorities,
}: MainContentProps) => {
  const { address } = useAccount();
  const toast = useToast();

  if (!hatData) return null;

  return (
    <Box w='100%' overflow='scroll' height='100%'>
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
              <Text color='blue.500'>{prettyIdToIp(hatData.prettyId)}</Text>
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

        <WearersList
          chainId={chainId}
          setModals={setModals}
          localOverlay={localOverlay}
          hatId={hatData.id}
          wearers={hatData.wearers}
          maxSupply={hatData.maxSupply}
          prettyId={hatData.prettyId}
          isAdminUser={isAdminUser}
        />

        {hatRoles?.length && (
          <Stack>
            <Heading size='sm' fontWeight='medium' textTransform='uppercase'>
              Guild Roles
            </Heading>
            {hatRoles?.map(({ role, guild }: any) => (
              <Flex
                key={role}
                align='center'
                justify='space-between'
                borderBottom='1px'
                borderColor='gray.200'
                py={2}
              >
                <Text>{role}</Text>

                <ChakraLink
                  href={`https://guild.xyz/${guild}`}
                  isExternal
                  display='block'
                >
                  <HStack spacing={3}>
                    <Text>Guild.xyz</Text>
                    <Icon as={FaExternalLinkAlt} w='12px' color='blue.500' />
                  </HStack>
                </ChakraLink>
              </Flex>
            ))}
          </Stack>
        )}

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
            Responsibilities
          </Heading>
          <UnorderedList>
            {!!responsibilities?.length &&
              responsibilities.map(({ label, link }: Responsibility) => (
                <ListItem key={label}>
                  <Flex justifyContent='space-between'>
                    <Text>{label}</Text>
                    {link && (
                      <ChakraLink isExternal href={link} display='block'>
                        <Icon
                          as={FaExternalLinkAlt}
                          w='12px'
                          color='blue.500'
                        />
                      </ChakraLink>
                    )}
                  </Flex>
                </ListItem>
              ))}
          </UnorderedList>
        </Stack>

        <Stack>
          <Heading size='sm' fontWeight='medium' textTransform='uppercase'>
            Responsibilities
          </Heading>
          <UnorderedList>
            {!!authorities?.length &&
              authorities.map(({ label, link }: Responsibility) => (
                <ListItem key={label}>
                  <Flex justifyContent='space-between'>
                    <Text>{label}</Text>
                    {link && (
                      <ChakraLink isExternal href={link} display='block'>
                        <Icon
                          as={FaExternalLinkAlt}
                          w='12px'
                          color='blue.500'
                        />
                      </ChakraLink>
                    )}
                  </Flex>
                </ListItem>
              ))}
          </UnorderedList>
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
              color={
                hatData?.toggle === address?.toLowerCase()
                  ? 'green.500'
                  : 'red.500'
              }
              ml={2}
            >
              <Text>
                {hatData?.toggle === address?.toLowerCase() ? 'Yes' : 'No'}
              </Text>
              {hatData?.toggle === address?.toLowerCase() ? (
                <FaCheck />
              ) : (
                <FaBan />
              )}
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
  hatRoles: any[];
  mutableStatus: string;
  activeStatus: string;
  setModals: any;
  localOverlay: any;
  isAdminUser: boolean;
  responsibilities: Responsibility[];
  authorities: Authority[];
}
