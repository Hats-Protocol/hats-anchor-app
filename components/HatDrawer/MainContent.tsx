import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  Image,
  Link,
  ListItem,
  Stack,
  Text,
  Tooltip,
  UnorderedList,
  useClipboard,
} from '@chakra-ui/react';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';
import {
  FaBan,
  FaCheck,
  FaCode,
  FaCopy,
  FaExternalLinkAlt,
} from 'react-icons/fa';

import { MUTABILITY, STATUS } from '@/constants';
import { Authority, Responsibility } from '@/forms/HatDetailsForm';
import HatLinkRequestApproveForm from '@/forms/HatLinkRequestApproveForm';
import useToast from '@/hooks/useToast';
import { checkAddressIsContract } from '@/lib/contract';
import { formatAddress } from '@/lib/general';
import { decimalId, prettyIdToIp } from '@/lib/hats';
import { explorerUrl } from '@/lib/web3';

import ChakraNextLink from '../ChakraNextLink';
import Modal from '../Modal';
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
  isCurrentWearer,
  linkRequestFromTree,
  currentNetworkId,
}: MainContentProps) => {
  const toast = useToast();
  const [linkFrom, setLinkFrom] = useState('');
  const [linkTo, setLinkTo] = useState('');
  const [isEligibilityAContract, setIsEligibilityAContract] = useState(false);
  const [isToggleAContract, setIsToggleAContract] = useState(false);
  const { onCopy } = useClipboard(decimalId(hatData?.id));

  const handleOpenLinkRequestApproveModal = (from: string, to: string) => {
    setLinkFrom(from);
    setLinkTo(to);
    setModals?.({ linkResponse: true });
  };

  function ensureProtocol(url: string) {
    if (!/^https?:\/\//i.test(url)) {
      return `http://${url}`;
    }
    return url;
  }

  useEffect(() => {
    const check = async () => {
      const isEligibility = await checkAddressIsContract(
        hatData?.eligibility,
        chainId,
      );
      const isToggle = await checkAddressIsContract(hatData?.toggle, chainId);
      setIsEligibilityAContract(isEligibility);
      setIsToggleAContract(isToggle);
    };
    check();
  }, [chainId, hatData]);

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
            <Stack w='full' spacing={1}>
              <HStack justifyContent='space-between'>
                <Tooltip label={name} aria-label='A tooltip'>
                  <Text fontSize={24} isTruncated fontWeight={600}>
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
                      onCopy();
                      toast.info({
                        title: 'Successfully copied Hat id to clipboard',
                      });
                    }}
                  />
                </HStack>
              </HStack>
              <Text opacity={0.6}>{description}</Text>
            </Stack>
          </Flex>
          <HStack>
            {isCurrentWearer && <Badge colorScheme='green'>My Hat</Badge>}
            <Badge
              colorScheme={
                mutableStatus === MUTABILITY.MUTABLE ? 'blue' : 'red'
              }
            >
              {mutableStatus}
            </Badge>
            <Badge>{activeStatus}</Badge>
            <Badge>Level {hatData?.levelAtLocalTree}</Badge>
          </HStack>
        </Stack>

        <WearersList
          hatName={name}
          chainId={chainId}
          setModals={setModals}
          localOverlay={localOverlay}
          hatId={hatData.id}
          wearers={hatData.wearers}
          maxSupply={hatData.maxSupply}
          prettyId={hatData.prettyId}
          isAdminUser={isAdminUser}
          currentNetworkId={currentNetworkId}
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
                      <ChakraNextLink
                        isExternal
                        href={ensureProtocol(link)}
                        display='block'
                      >
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
              authorities.map(({ label, link }: Authority) => (
                <ListItem key={label}>
                  <Flex justifyContent='space-between'>
                    <Text>{label}</Text>
                    {link && (
                      <ChakraNextLink
                        isExternal
                        href={ensureProtocol(link)}
                        display='block'
                      >
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
          <HStack justifyContent='space-between'>
            <Heading size='sm' fontWeight='medium' textTransform='uppercase'>
              Eligibility
            </Heading>
            <Tooltip label={hatData.eligibility} shouldWrapChildren>
              <ChakraNextLink
                href={`${explorerUrl(chainId)}/address/${hatData.eligibility}`}
                isExternal
              >
                <HStack>
                  {isEligibilityAContract ? (
                    <Icon as={FaCode} ml={2} w={4} h={4} color='gray.500' />
                  ) : (
                    <Image
                      src='/icons/wearers.svg'
                      alt='Wearers'
                      w={4}
                      h={4}
                      color='gray.500'
                    />
                  )}
                  <Text color='gray.500' fontSize='sm'>
                    {formatAddress(hatData.eligibility)}
                  </Text>
                </HStack>
              </ChakraNextLink>
            </Tooltip>
          </HStack>
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
          <HStack justifyContent='space-between'>
            <Heading size='sm' fontWeight='medium' textTransform='uppercase'>
              Toggle
            </Heading>
            <Tooltip label={hatData.toggle} shouldWrapChildren>
              <ChakraNextLink
                href={`${explorerUrl(chainId)}/address/${hatData.eligibility}`}
                isExternal
              >
                <HStack>
                  {isToggleAContract ? (
                    <Icon as={FaCode} ml={2} w={4} h={4} color='gray.500' />
                  ) : (
                    <Image
                      src='/icons/wearers.svg'
                      alt='Wearers'
                      w={4}
                      h={4}
                      color='gray.500'
                    />
                  )}
                  <Text color='gray.500' fontSize='sm'>
                    {formatAddress(hatData.toggle)}
                  </Text>
                </HStack>
              </ChakraNextLink>
            </Tooltip>
          </HStack>
          <Flex justifyContent='space-between'>
            <HStack>
              <Text>Is this hat active?</Text>
            </HStack>

            <HStack
              color={activeStatus === STATUS.ACTIVE ? 'green.500' : 'red.500'}
              ml={2}
            >
              <Text>{activeStatus === STATUS.ACTIVE ? 'Yes' : 'No'}</Text>
              {activeStatus === STATUS.ACTIVE ? <FaCheck /> : <FaBan />}
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
  currentNetworkId?: number;
}
