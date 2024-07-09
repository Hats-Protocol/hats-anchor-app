'use client';

import {
  Box,
  Flex,
  HStack,
  Icon,
  Image,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import {
  AUTHORITY_ENFORCEMENT,
  AUTHORITY_PLATFORMS,
} from '@hatsprotocol/constants';
import { useSelectedHat, useTreeForm } from 'contexts';
import { currentHsgThreshold } from 'hats-utils';
import { useMediaStyles, useSafeDetails } from 'hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import posthog from 'posthog-js';
import { useMemo } from 'react';
import { Authority, HatWearer } from 'types';
import { ChakraNextLink, IconHandler } from 'ui';
import { authorityImageHandler, getHostnameFromURL, validateURL } from 'utils';
import { Hex } from 'viem';

const BoxArrowUpRightOut = dynamic(() =>
  import('icons').then((i) => i.BoxArrowUpRightOut),
);

const HOSTNAME_LABELS = {
  'charmverse.io': 'Charmverse',
  'telegram.me': 'Telegram',
  'deform.cc': 'Deform',
  'github.com': 'GitHub',
  'twitter.com': 'Twitter',
  'discord.com': 'Discord',
  'medium.com': 'Medium',
  'paragraph.xyz': 'Paragraph',
  'substack.com': 'Substack',
  'mirror.xyz': 'Mirror',
};

const getHostnameLabel = (hostname: string) => {
  const hostnameLabel = _.find(_.keys(HOSTNAME_LABELS), (k: string) =>
    hostname.includes(k),
  );
  if (!hostnameLabel) return undefined;
  return HOSTNAME_LABELS[hostnameLabel as keyof typeof HOSTNAME_LABELS];
};

const AuthorityHeader = ({
  authority,
  editingItem,
  isExpanded,
}: AuthorityHeaderProps) => {
  const { label, subLabel, link, type, hsgConfig, safe } = _.pick(authority, [
    'label',
    'subLabel',
    'link',
    'type',
    'hsgConfig',
    'safe',
  ]);
  const {
    label: currentLabel,
    imageUrl: currentImageUrl,
    link: currentLink,
  } = _.pick(editingItem, ['label', 'imageUrl', 'link']);
  const { chainId, editMode } = useTreeForm();
  const { selectedHat } = useSelectedHat();
  const { isMobile } = useMediaStyles();

  const localLink = editingItem ? currentLink : link;
  const authorityEnforcement = type
    ? AUTHORITY_ENFORCEMENT[type as keyof typeof AUTHORITY_ENFORCEMENT]
    : AUTHORITY_ENFORCEMENT.manual;
  const authorityEnforcementLabel = _.find(
    _.keys(AUTHORITY_PLATFORMS),
    (k: string) =>
      localLink?.includes(_.toLower(k)) || localLink?.includes(_.toLower(k)),
  );
  const currentAuthorityEnforcement = authorityEnforcementLabel
    ? AUTHORITY_PLATFORMS[authorityEnforcementLabel as string]
    : undefined;

  // set current image
  const { icon, isIpfs, imageUrl } = authorityImageHandler({
    authority,
    editingItem,
    authorityEnforcement,
    currentImageUrl,
  });

  const { data: safeOwners } = useSafeDetails({
    safeAddress: safe,
    chainId,
    enabled: !!safe,
    editMode,
  });

  const eligibleSigners = useMemo(() => {
    if (!safeOwners || !selectedHat?.wearers) return [];

    const wearersLowercased = _.map(selectedHat.wearers, (wearer: HatWearer) =>
      _.toLower(wearer.id),
    ) as unknown as Hex[];

    return _.reject(
      safeOwners,
      (owner: Hex) => !_.includes(wearersLowercased, _.toLower(owner)),
    );
  }, [safeOwners, selectedHat?.wearers]);
  const hsgThresholdText = currentHsgThreshold({
    authority,
    hsgConfig,
    eligibleSigners,
  });

  const enforcementIcon =
    authority?.type &&
    AUTHORITY_ENFORCEMENT[authority.type as keyof typeof AUTHORITY_ENFORCEMENT]
      .enforcementIcon;

  return (
    <Flex gap={4} w='100%' justify='space-between' align='center'>
      <HStack align='start'>
        <Flex boxSize={6} justify='center' align='center' position='relative'>
          {!isExpanded && (
            <Image
              src={enforcementIcon}
              alt='authority enforcement indicator'
              position='absolute'
              top='1px' // slightly offset to align with icon/image
              left={0}
            />
          )}

          <IconHandler
            icon={icon}
            authorityEnforcement={
              currentAuthorityEnforcement || authorityEnforcement
            }
            imageUrl={imageUrl}
            isIpfs={isIpfs}
            isExpanded={isExpanded || false}
          />
        </Flex>

        <Box textAlign='left'>
          <HStack>
            {typeof label !== 'string' ? (
              label
            ) : (
              <Text
                size={{ base: 'sm', md: 'md' }}
                // TODO should be a Heading component when expanded
                fontWeight={
                  isExpanded ? (isMobile ? 'bold' : 'medium') : 'normal'
                }
                noOfLines={2}
              >
                {currentLabel || label || 'New Authority'}
                {hsgThresholdText && ` (${hsgThresholdText})`}
              </Text>
            )}

            {subLabel && (
              <Text size='xs' fontFamily='monospace' color='gray.700'>
                {subLabel}
              </Text>
            )}
          </HStack>
        </Box>
      </HStack>
      {!isExpanded && !isMobile && localLink && validateURL(localLink) && (
        <ChakraNextLink
          isExternal
          href={localLink}
          display='block'
          onClick={() => {
            posthog.capture('Clicked Authority Link', {
              authority: label,
              link: localLink,
              label: getHostnameLabel(getHostnameFromURL(localLink)),
            });
          }}
        >
          <Tooltip label={getHostnameFromURL(localLink)}>
            <HStack spacing={1} color='blue.500'>
              <Text size='sm'>
                {getHostnameLabel(getHostnameFromURL(localLink))}
              </Text>
              <Icon as={BoxArrowUpRightOut} boxSize={3} />
            </HStack>
          </Tooltip>
        </ChakraNextLink>
      )}
    </Flex>
  );
};

interface AuthorityHeaderProps {
  authority: Authority | undefined;
  editingItem?: Authority;
  isExpanded?: boolean;
}

export default AuthorityHeader;
