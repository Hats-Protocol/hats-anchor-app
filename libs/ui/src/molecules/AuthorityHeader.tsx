import {
  Box,
  Circle,
  Flex,
  HStack,
  Icon,
  IconButton,
  Image,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import {
  AUTHORITY_ENFORCEMENT,
  AUTHORITY_PLATFORMS,
  AUTHORITY_TYPES,
  AuthorityInfo,
  AuthorityPlatform,
} from '@hatsprotocol/constants';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useSafeDetails } from 'hooks';
import { useTreeForm } from 'contexts';
import { Authority } from 'hats-types';
import _ from 'lodash';
import { useMemo } from 'react';
import { BsInfoCircle } from 'react-icons/bs';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { getHostnameFromURL, ipfsUrl, validateURL } from 'utils';
import { Hex } from 'viem';

import { ChakraNextLink } from '../atoms';

const checkIfIpfs = (url: string | undefined) => {
  if (!url) return { isIpfs: false, imageUrl: '' };

  return {
    isIpfs: url.startsWith('ipfs://'),
    imageUrl: url,
  };
};

const authorityImageHandler = ({
  authority,
  editingItem,
  authorityEnforcement,
  currentImageUrl,
}: AuthorityImageHandlerProps) => {
  const { type, imageUrl, id } = _.pick(authority, ['type', 'imageUrl', 'id']);

  if (!authority) return checkIfIpfs('');

  if (editingItem) return checkIfIpfs(currentImageUrl);
  if (type === AUTHORITY_TYPES.gate) {
    const platformById =
      AUTHORITY_PLATFORMS[id as keyof typeof AUTHORITY_PLATFORMS];
    const matchingPlatform = _.find(
      _.values(AUTHORITY_PLATFORMS),
      (v: AuthorityPlatform) =>
        authority.gate?.includes(_.toLower(v.label)) ||
        authority.link?.includes(_.toLower(v.label)) ||
        _.toLower(authority.label)?.includes(_.toLower(v.label)),
    );
    if (platformById) return checkIfIpfs(platformById.icon);
    if (matchingPlatform) return checkIfIpfs(matchingPlatform.icon);
    if (authority.link?.includes('docs.google')) {
      return checkIfIpfs(AUTHORITY_PLATFORMS[4].icon);
    }
  }
  if (authority && authorityEnforcement.imageUri) {
    return checkIfIpfs(authorityEnforcement.imageUri);
  }

  return checkIfIpfs(imageUrl);
};

const AuthorityHeader = ({
  authority,
  editingItem,
  hideInfo,
}: AuthorityHeaderProps) => {
  const { label, subLabel, link, type, hsgConfig, safe, strategies, hatId } =
    _.pick(authority, [
      'label',
      'subLabel',
      'link',
      'type',
      'hsgConfig',
      'safe',
      'strategies',
      'hatId',
    ]);
  const {
    label: currentLabel,
    imageUrl: currentImageUrl,
    link: currentLink,
  } = _.pick(editingItem, ['label', 'imageUrl', 'link']);
  const { chainId, selectedHat, editMode } = useTreeForm();

  const localLink = editingItem ? currentLink : link;
  const authorityEnforcement = type
    ? AUTHORITY_ENFORCEMENT[type]
    : AUTHORITY_ENFORCEMENT.manual;

  // set current image
  const { isIpfs, imageUrl } = authorityImageHandler({
    authority,
    editingItem,
    authorityEnforcement,
    currentImageUrl,
  });

  // set tooltip info
  let tooltipInfo = authorityEnforcement.info;
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

  const { data: safeOwners } = useSafeDetails({
    safeAddress: safe,
    chainId,
    enabled: !!safe,
    editMode,
  });
  const eligibleSigners = useMemo(() => {
    if (!safeOwners || !selectedHat?.wearers) return [];
    return _.filter(
      safeOwners,
      (owner: Hex) =>
        !_.includes(_.map(selectedHat.wearers, 'id'), _.toLower(owner)),
    );
  }, [safeOwners, selectedHat?.wearers]);
  const currentThresholdConfig = useMemo(() => {
    if (authority?.label === 'HSG Owner' || !hsgConfig) return undefined;
    const minThreshold = _.toNumber(hsgConfig?.minThreshold);
    const maxThreshold = _.toNumber(hsgConfig?.maxThreshold);
    const currentSigners = _.size(eligibleSigners);
    if (currentSigners < minThreshold) {
      return `${currentSigners}/${minThreshold}`;
    }
    if (currentSigners > maxThreshold) {
      return `${maxThreshold}/${currentSigners}`;
    }
    return `${currentSigners}/${currentSigners}`;
  }, [hsgConfig, eligibleSigners, authority?.label]);

  return (
    <Flex gap={4} w='100%' justify='space-between' align='center'>
      <HStack spacing={4}>
        <Image
          src={
            isIpfs
              ? ipfsUrl(imageUrl?.slice(7)) || ''
              : imageUrl ||
                authorityEnforcement.imageUri ||
                '/icons/authority.svg'
          }
          boxSize='50px'
          border='1px solid'
          borderColor='blackAlpha.300'
          borderRadius='full'
          alt='authority image'
        />
        <Box textAlign='left'>
          <HStack>
            <Text size='md' variant='medium' noOfLines={1}>
              {currentLabel || label || 'New Authority'}
              {currentThresholdConfig && ` (${currentThresholdConfig} signers)`}
            </Text>
            {subLabel && (
              <Text size='xs' fontFamily='monospace' color='gray.700'>
                {subLabel}
              </Text>
            )}
          </HStack>

          {!hideInfo ? (
            <Tooltip
              label={tooltipInfo}
              placement='right'
              hasArrow
              shouldWrapChildren
            >
              <HStack>
                <Circle size='10px' bg={authorityEnforcement.color} />
                <Text size='sm'>{authorityEnforcement.label}</Text>
                <Icon as={BsInfoCircle} boxSize='12px' cursor='pointer' />
              </HStack>
            </Tooltip>
          ) : (
            <HStack>
              <Circle size='10px' bg={authorityEnforcement.color} />
              <Text size='sm'>{authorityEnforcement.label}</Text>
            </HStack>
          )}
        </Box>
      </HStack>
      {localLink && validateURL(localLink) && (
        <ChakraNextLink isExternal href={localLink} display='block'>
          <Tooltip label={getHostnameFromURL(localLink)}>
            <IconButton
              icon={<Icon as={FaExternalLinkAlt} />}
              aria-label='Authority Link'
              colorScheme='blue'
              size='sm'
              variant='solid'
            />
          </Tooltip>
        </ChakraNextLink>
      )}
    </Flex>
  );
};

interface AuthorityHeaderProps {
  authority: Authority | undefined;
  editingItem?: Authority;
  hideInfo?: boolean;
}

interface AuthorityImageHandlerProps {
  authority: Authority | undefined;
  editingItem?: Authority;
  authorityEnforcement: AuthorityInfo;
  currentImageUrl?: string;
}

export default AuthorityHeader;
