import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  ListItem,
  Stack,
  Text,
  Tooltip,
  UnorderedList,
} from '@chakra-ui/react';
import { formatDistanceToNow } from 'date-fns';
import { FaBan, FaCheck, FaCopy, FaExternalLinkAlt } from 'react-icons/fa';
import { useAccount } from 'wagmi';

import { Authority } from '@/forms/AuthorityDetailsForm';
import { Responsibility } from '@/forms/ResponsibilityDetailsForm';
import useToast from '@/hooks/useToast';
import { explorerUrl } from '@/lib/general';
import { prettyIdToIp } from '@/lib/hats';

import ChakraNextLink from '../ChakraNextLink';
import WearersList from './WearersList';
import Modal from '../Modal';
import HatLinkRequestApproveForm from '@/forms/HatLinkRequestApproveForm';
import { useState } from 'react';

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
  isCurrentWearer,
  linkRequestFromTree,
}: MainContentProps) => {
  console.log('linkRequestFromTree', linkRequestFromTree);
  console.log(hatData);
  const { address } = useAccount();
  const toast = useToast();
  const [linkFrom, setLinkFrom] = useState('');
  const [linkTo, setLinkTo] = useState('');

  const handleOpenLinkRequestApproveModal = (from: string, to: string) => {
    setLinkFrom(from);
    setLinkTo(to);
    setModals?.({ linkResponse: true });
  };

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
            <Stack w='full'>
              <HStack justifyContent='space-between'>
                <Tooltip label={name} aria-label='A tooltip'>
                  <Text fontSize={24} isTruncated>
                    {name}
                  </Text>
                </Tooltip>
                <HStack>
                  <Text whiteSpace='nowrap'>Hat ID:</Text>
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
              </HStack>
              <Text>{description}</Text>
            </Stack>
          </Flex>
          <HStack>
            {isCurrentWearer && <Badge colorScheme='green'>My Hat</Badge>}
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

                <ChakraNextLink
                  href={`https://guild.xyz/${guild}`}
                  isExternal
                  display='block'
                >
                  <HStack spacing={3}>
                    <Text>Guild.xyz</Text>
                    <Icon as={FaExternalLinkAlt} w='12px' color='blue.500' />
                  </HStack>
                </ChakraNextLink>
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
            Responsibilities
          </Heading>
          <UnorderedList>
            {responsibilities?.length ? (
              responsibilities.map(({ label, link }: Responsibility) => (
                <ListItem key={label}>
                  <Flex justifyContent='space-between'>
                    <Text>{label}</Text>
                    {link && (
                      <ChakraNextLink isExternal href={link} display='block'>
                        <Icon
                          as={FaExternalLinkAlt}
                          w='12px'
                          color='blue.500'
                        />
                      </ChakraNextLink>
                    )}
                  </Flex>
                </ListItem>
              ))
            ) : (
              <ListItem>None</ListItem>
            )}
          </UnorderedList>
        </Stack>

        <Stack>
          <Heading size='sm' fontWeight='medium' textTransform='uppercase'>
            Authorities
          </Heading>
          <UnorderedList>
            {authorities?.length ? (
              authorities.map(({ label, link }: Responsibility) => (
                <ListItem key={label}>
                  <Flex justifyContent='space-between'>
                    <Text>{label}</Text>
                    {link && (
                      <ChakraNextLink isExternal href={link} display='block'>
                        <Icon
                          as={FaExternalLinkAlt}
                          w='12px'
                          color='blue.500'
                        />
                      </ChakraNextLink>
                    )}
                  </Flex>
                </ListItem>
              ))
            ) : (
              <ListItem>None</ListItem>
            )}
          </UnorderedList>
        </Stack>

        <Stack>
          <Heading size='sm' fontWeight='medium' textTransform='uppercase'>
            Eligibility
          </Heading>
          <Flex justifyContent='space-between'>
            <HStack>
              <Text>Can I wear this hat?</Text>
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
              <Text>Is this hat active?</Text>
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

        {isAdminUser &&
          linkRequestFromTree?.some(
            (linkRequest) =>
              linkRequest.requestedLinkToHat?.prettyId === hatData.prettyId,
          ) && (
            <Stack wrap='wrap'>
              <Heading size='sm' fontWeight='medium' textTransform='uppercase'>
                Link Requests
              </Heading>
              <Flex justifyContent='space-between'>
                <HStack>
                  {linkRequestFromTree?.map((linkRequest) => (
                    <Button
                      variant='outline'
                      onClick={() =>
                        handleOpenLinkRequestApproveModal(
                          linkRequest.id,
                          linkRequest.requestedLinkToHat.prettyId,
                        )
                      }
                      key={linkRequest.id}
                    >
                      Link Request to {prettyIdToIp(linkRequest.id)}
                    </Button>
                  ))}
                </HStack>
              </Flex>
            </Stack>
          )}

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

                <ChakraNextLink
                  isExternal
                  href={`${explorerUrl(chainId)}/tx/${event?.transactionID}`}
                  display='block'
                >
                  <HStack spacing={3}>
                    <Text>{event?.id?.split('-')[0]}</Text>
                    <Icon as={FaExternalLinkAlt} w='12px' color='blue.500' />
                  </HStack>
                </ChakraNextLink>
              </Flex>
            ))}
          </Box>
        </Stack>
      </Stack>

      <Modal
        name='linkResponse'
        title='Approve Link Request'
        localOverlay={localOverlay}
      >
        <HatLinkRequestApproveForm
          topHatDomain={linkFrom}
          newAdmin={linkTo}
          hatData={hatData}
          chainId={chainId}
        />
      </Modal>
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
  isCurrentWearer: boolean;
  isAdminUser: boolean;
  responsibilities: Responsibility[];
  authorities: Authority[];
  linkRequestFromTree: any[];
  setModals: any;
  localOverlay: any;
}
