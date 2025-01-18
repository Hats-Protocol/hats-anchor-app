'use client';

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
} from '@chakra-ui/react';
import { AUTHORITY_ENFORCEMENT, AUTHORITY_TYPES } from '@hatsprotocol/constants';
import { useSelectedHat, useTreeForm } from 'contexts';
import { useMediaStyles } from 'hooks';
import _, { get, pick } from 'lodash';
import { AuthorityHeader } from 'molecules';
import dynamic from 'next/dynamic';
import posthog from 'posthog-js';
import { startTransition, useEffect, useRef, useState } from 'react';
import { BsInfoCircle } from 'react-icons/bs';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { Authority, AuthorityType } from 'types';
import { Link, Markdown } from 'ui';
import { getHostnameFromURL, validateURL } from 'utils';

import ModuleAuthorityToolbar from './ModuleAuthorityToolbar';

const BoxArrowUpRightOut = dynamic(() => import('icons').then((mod) => mod.BoxArrowUpRightOut));
const CheckCircle = dynamic(() => import('icons').then((mod) => mod.CheckCircle));
const Collapse = dynamic(() => import('icons').then((mod) => mod.Collapse));
const HSGDetails = dynamic(() => import('modules-ui').then((mod) => mod.HSGDetails));
const ModuleCardDetails = dynamic(() => import('modules-ui').then((mod) => mod.ModuleCardDetails));

const AuthoritiesListCard = ({
  authority,
  type,
  index,
}: {
  authority?: Authority;
  type: AuthorityType;
  index: number;
}) => {
  const { label, description, link, gate, strategies, hatId } = pick(authority, [
    'label',
    'description',
    'link',
    'gate',
    'strategies',
    'hatId',
  ]);

  const gateHostName = getHostnameFromURL(gate);
  const linkHostName = getHostnameFromURL(link);
  const { isMobile } = useMediaStyles();
  const { chainId } = useTreeForm();
  const { selectedHat } = useSelectedHat();
  const [expanded, setExpanded] = useState(false);
  const isMounted = useRef(false);

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
    type === AUTHORITY_TYPES.modules || type === AUTHORITY_TYPES.hsg || type === AUTHORITY_TYPES.account;

  const authorityEnforcement = type ? AUTHORITY_ENFORCEMENT[type] : AUTHORITY_ENFORCEMENT.manual;

  // set tooltip info
  // TODO refactor to util/hook
  let tooltipInfo = authorityEnforcement?.info;
  if (strategies) {
    tooltipInfo = `Automatically pulled in from Snapshot. Voting weight in ${_.size(
      strategies,
    )} ${_.size(strategies) === 1 ? 'strategy.' : 'strategies.'}`;
  }
  if (type === AUTHORITY_TYPES.modules && hatId) {
    tooltipInfo = `Connected onchain via the ${label}`; //  module for Hat #${hatIdDecimalToIp(BigInt(hatId))}
  }

  const handleToggle = () => {
    posthog.capture('Toggled Authority', {
      label,
      is_open: expanded,
    });
    setExpanded(!expanded);
  };

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      setExpanded(false);
    };
  }, []);

  if (!gate && !description && type !== AUTHORITY_TYPES.modules && type !== AUTHORITY_TYPES.hsg) {
    return (
      <Skeleton isLoaded={authority?.label !== 'Loading...'} h={authority?.label === 'Loading...' ? '25px' : 'auto'}>
        <Flex py={2} px={{ base: 4, md: 0 }}>
          <AuthorityHeader authority={authority} />
        </Flex>
      </Skeleton>
    );
  }

  // TODO make enforcement tooltip work as a popover on mobile

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
          if (isMounted.current && expanded !== isExpanded) {
            startTransition(() => handleToggle());
          }

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
                <AuthorityHeader authority={authority} isExpanded={isExpanded} />
                {isMobile && <AccordionIcon mr={isExpanded ? 1 : 0} color='blackAlpha.600' />}
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
                boxShadow={isExpanded ? '0px 10px 6px -6px rgba(0, 0, 0, 0.10)' : 'none'}
              >
                <Stack px={4}>
                  <Box>
                    <HStack>
                      <Image src={authorityEnforcement.enforcementIcon} alt='Hat' boxSize={6} />
                      <HStack spacing={1}>
                        <Text>{authorityEnforcement.label}</Text>
                        {!isMobile && (
                          <Tooltip label={tooltipInfo} shouldWrapChildren placement='top'>
                            <Icon as={BsInfoCircle} boxSize={4} cursor='pointer' />
                          </Tooltip>
                        )}
                      </HStack>
                    </HStack>
                  </Box>

                  {displayModulesToolbar ? (
                    <ModuleAuthorityToolbar authority={authority} index={index} isExpanded={isExpanded} />
                  ) : (
                    <HStack mb={!description ? 4 : 0}>
                      {link && validateURL(link) && (
                        <Link href={link} className='block' isExternal>
                          {linkName || linkHostName ? (
                            <Button
                              rightIcon={<Icon as={BoxArrowUpRightOut} boxSize={3} />}
                              onClick={() => {
                                posthog.capture('Clicked Authority Link', {
                                  authority: label,
                                  link,
                                  link_name: linkName || linkHostName,
                                  is_gate: false,
                                });
                              }}
                              colorScheme='Functional-LinkPrimary'
                              size='sm'
                              variant='filled'
                            >
                              {linkName || linkHostName}
                            </Button>
                          ) : (
                            <IconButton
                              icon={<Icon as={BoxArrowUpRightOut} boxSize={3} />}
                              onClick={() => {
                                posthog.capture('Clicked Authority Link', {
                                  authority: label,
                                  link,
                                  label: linkName || linkHostName,
                                  is_gate: false,
                                });
                              }}
                              colorScheme='Functional-LinkPrimary'
                              aria-label='Authority Link'
                              size='sm'
                              variant='filled'
                            />
                          )}
                        </Link>
                      )}
                      {gate && validateURL(gate) && (
                        <Link href={gate} className='block' isExternal>
                          <Button
                            rightIcon={<Icon as={FaExternalLinkAlt} />}
                            color='Functional-LinkPrimary'
                            borderColor='Functional-LinkPrimary'
                            variant='outlineMatch'
                            size='sm'
                            onClick={() => {
                              posthog.capture('Clicked Authority Link', {
                                authority: label,
                                link,
                                link_name: linkName || linkHostName,
                                is_gate: true,
                              });
                            }}
                          >
                            {gateHostName}
                          </Button>
                        </Link>
                      )}
                    </HStack>
                  )}
                  {type === AUTHORITY_TYPES.hsg && authority?.hsgConfig && (
                    <Box pt={2} pb={3}>
                      <HSGDetails hsgConfig={authority.hsgConfig} selectedHat={selectedHat} chainId={chainId} />
                    </Box>
                  )}
                  {type === AUTHORITY_TYPES.modules && (
                    <Box pt={2} pb={3}>
                      <ModuleCardDetails
                        hat={selectedHat}
                        moduleInfo={get(authority, 'moduleInfo')}
                        chainId={chainId}
                      />
                    </Box>
                  )}
                  {type !== AUTHORITY_TYPES.modules &&
                    description &&
                    (typeof description === 'string' ? (
                      <Box>
                        <Markdown>{description}</Markdown>
                      </Box>
                    ) : (
                      <Box pt={link || gate ? 2 : 0} pb={3}>
                        {description}
                      </Box>
                    ))}
                </Stack>
                {displayModulesToolbar && (
                  <Flex w='100%' bg='green.50' color='green.600' px={4} py={1} mt={2} borderBottomRadius='md'>
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
