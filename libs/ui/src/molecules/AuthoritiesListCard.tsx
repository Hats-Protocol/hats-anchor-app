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
  Icon,
  IconButton,
  Image,
  Skeleton,
  Stack,
  Text,
  Tooltip,
  useBreakpointValue,
} from '@chakra-ui/react';
import {
  AUTHORITY_ENFORCEMENT,
  AUTHORITY_TYPES,
} from '@hatsprotocol/constants';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useMediaStyles } from 'hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { startTransition, useEffect, useRef, useState } from 'react';
import { BsInfoCircle } from 'react-icons/bs';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { Authority, AuthorityType } from 'types';
import { getHostnameFromURL, validateURL } from 'utils';

import { ChakraNextLink, Markdown } from '../atoms';
import AuthorityHeader from './AuthorityHeader';
import ModuleAuthorityToolbar from './ModuleAuthorityToolbar';

const BoxArrowUpRightOut = dynamic(() =>
  import('icons').then((mod) => mod.BoxArrowUpRightOut),
);
const CheckCircle = dynamic(() =>
  import('icons').then((mod) => mod.CheckCircle),
);
const Collapse = dynamic(() => import('icons').then((mod) => mod.Collapse));

const AuthoritiesListCard = ({
  authority,
  type,
  index,
}: {
  authority?: Authority;
  type: AuthorityType;
  index: number;
}) => {
  const { label, description, link, gate, strategies, hatId } = _.pick(
    authority,
    ['label', 'description', 'link', 'gate', 'strategies', 'hatId'],
  );
  const gateHostName = getHostnameFromURL(gate);
  const linkHostName = getHostnameFromURL(link);
  const { isMobile } = useMediaStyles();
  const [expanded, setExpanded] = useState(false);
  const isMounted = useRef(false);
  const smallFont = useBreakpointValue({ base: true, md: false });

  // consolidate with util in AuthorityHeader
  const discordHosts = ['discord.gg', 'discord.com'];
  let linkName = '';
  if (_.includes(discordHosts, linkHostName)) {
    linkName = 'Go to Discord';
  } else if (linkHostName === 'docs.google.com') {
    linkName = 'Open Doc';
  } else if (linkHostName === 'github.com') {
    linkName = 'Go to Repo';
  } else if (linkHostName === 'snapshot.org') {
    linkName = 'Go to Space';
  }

  const displayModulesToolbar =
    type === AUTHORITY_TYPES.modules ||
    type === AUTHORITY_TYPES.hsg ||
    type === AUTHORITY_TYPES.wallet;

  const authorityEnforcement = type
    ? AUTHORITY_ENFORCEMENT[type]
    : AUTHORITY_ENFORCEMENT.manual;

  // set tooltip info
  // TODO refactor to util/hook
  let tooltipInfo = authorityEnforcement?.info;
  if (strategies) {
    tooltipInfo = `Automatically pulled in from Snapshot. Voting weight in ${_.size(
      strategies,
    )} ${_.size(strategies) === 1 ? 'strategy.' : 'strategies.'}`;
  }
  if (type === AUTHORITY_TYPES.modules && hatId) {
    tooltipInfo = `Connected onchain via the ${label} module for Hat #${hatIdDecimalToIp(
      BigInt(hatId),
    )}`;
  }

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      setExpanded(false);
    };
  }, []);

  if (!gate && !description) {
    return (
      <Skeleton
        isLoaded={authority?.label !== 'Loading...'}
        h={authority?.label === 'Loading...' ? '25px' : 'auto'}
      >
        <Flex py={2} px={{ base: 4, md: 0 }}>
          <AuthorityHeader authority={authority} />
        </Flex>
      </Skeleton>
    );
  }

  return (
    <Accordion allowToggle>
      <AccordionItem
        border='none'
        w={{ base: '100%', md: 'calc(100% + 32px)' }}
        ml={{ md: -4 }}
        boxShadow={expanded ? 'md' : 'none'}
        borderRadius={{ md: 'md' }}
      >
        {({ isExpanded }) => {
          if (isMounted.current) startTransition(() => setExpanded(isExpanded));

          return (
            <>
              <AccordionButton
                borderY='1px solid'
                borderColor='transparent'
                _hover={{
                  borderColor: !isExpanded && 'blue.300',
                  borderTopColor: isExpanded ? 'gray.100' : 'transparent',
                  bg: 'white',
                  borderRadius: !isMobile ? 'md' : 0,
                }}
                _focus={{
                  borderBottomColor: 'transparent',
                }}
                _expanded={{
                  bg: 'white',
                  pb: 0,
                  borderTopColor: 'gray.100',
                  // boxShadow: isMobile
                  //   ? '0px 1px 3px 0px rgba(0, 0, 0, 0.1), 0px 1px 5px 0px rgba(0, 0, 0, 0.15)'
                  //   : 'none',
                  borderRadius: 0,
                  borderTopRadius: !isMobile ? 'md' : 0,
                }}
                position='relative'
              >
                <AuthorityHeader
                  authority={authority}
                  isExpanded={isExpanded}
                />
                {isMobile && <AccordionIcon />}
                {isExpanded && !isMobile && (
                  <Icon
                    as={Collapse}
                    w='14px'
                    position='absolute'
                    color='Functional-LinkSecondary'
                    zIndex={10}
                    bottom={-2}
                    right={4}
                  />
                )}
              </AccordionButton>
              <AccordionPanel
                p={0}
                // mb={isExpanded ? 4 : 0} // TODO giving a weird jumping effect on transition
                bg={isExpanded ? 'white' : undefined}
                borderBottomRadius={{ md: 'md' }}
                boxShadow={
                  isExpanded ? '0px 10px 6px -6px rgba(0, 0, 0, 0.10)' : 'none'
                }
              >
                <Stack px={4}>
                  <Box>
                    <Tooltip
                      label={tooltipInfo}
                      shouldWrapChildren
                      placement='top'
                    >
                      <HStack mb={2}>
                        <Image
                          src={authorityEnforcement.enforcementIcon}
                          alt='Hat'
                          boxSize={6}
                        />
                        <HStack spacing={1}>
                          <Text size={{ base: 'sm', md: 'md' }}>
                            {authorityEnforcement.label}
                          </Text>
                          <Icon
                            as={BsInfoCircle}
                            boxSize={{ base: 3, md: '14px' }}
                            cursor='pointer'
                          />
                        </HStack>
                      </HStack>
                    </Tooltip>
                  </Box>

                  {displayModulesToolbar ? (
                    <ModuleAuthorityToolbar
                      authority={authority}
                      index={index}
                    />
                  ) : (
                    <HStack mb={!description ? 4 : 0}>
                      {link && validateURL(link) && (
                        <ChakraNextLink isExternal href={link} display='block'>
                          {linkName || linkHostName ? (
                            <Button
                              rightIcon={
                                <Icon as={BoxArrowUpRightOut} boxSize={3} />
                              }
                              colorScheme='blue'
                              size='sm'
                              fontWeight='normal'
                              variant='solid'
                            >
                              {linkName || linkHostName}
                            </Button>
                          ) : (
                            <IconButton
                              icon={
                                <Icon as={BoxArrowUpRightOut} boxSize={3} />
                              }
                              colorScheme='blue'
                              aria-label='Authority Link'
                              size='sm'
                              variant='solid'
                            />
                          )}
                        </ChakraNextLink>
                      )}
                      {gate && validateURL(gate) && (
                        <ChakraNextLink isExternal href={gate} display='block'>
                          <Button
                            rightIcon={<Icon as={FaExternalLinkAlt} />}
                            color='blue.500'
                            borderColor='blue.500'
                            variant='outlineMatch'
                            size='sm'
                          >
                            {gateHostName}
                          </Button>
                        </ChakraNextLink>
                      )}
                    </HStack>
                  )}
                  {description && (
                    <Box pt={link || gate ? 2 : 0} pb={3}>
                      <Markdown smallFont={smallFont}>{description}</Markdown>
                    </Box>
                  )}
                </Stack>
                {displayModulesToolbar && (
                  <Flex
                    w='100%'
                    bg='green.50'
                    color='green.600'
                    px={4}
                    py={1}
                    borderBottomRadius='md'
                  >
                    <HStack>
                      <Icon as={CheckCircle} boxSize='14px' />
                      <Text size='sm' variant='medium'>
                        Verified Module
                      </Text>
                    </HStack>
                  </Flex>
                )}
              </AccordionPanel>
            </>
          );
        }}
      </AccordionItem>
    </Accordion>
  );
};

export default AuthoritiesListCard;
