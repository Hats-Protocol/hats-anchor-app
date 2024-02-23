import {
  Box,
  Flex,
  HStack,
  Icon,
  Image,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { AUTHORITY_ENFORCEMENT } from '@hatsprotocol/constants';
import { useTreeForm } from 'contexts';
import { Authority } from 'hats-types';
import { useMediaStyles, useSafeDetails } from 'hooks';
import _ from 'lodash';
import { useMemo } from 'react';
import {
  authorityImageHandler,
  getHostnameFromURL,
  ipfsUrl,
  validateURL,
} from 'utils';

import { ChakraNextLink } from '../atoms';
import { BoxArrowUpRightOut, HatIcon } from '../icons';

const hostnameLabels = {
  'charmverse.io': 'Charmverse',
  'telegram.me': 'Telegram',
  'deform.cc': 'Deform',
};

const getHostnameLabel = (hostname: string) => {
  const hostnameLabel = _.find(_.keys(hostnameLabels), (k: string) =>
    hostname.includes(k),
  );
  if (hostnameLabel) return hostnameLabels[hostnameLabel];
  return undefined;
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
  const { chainId, selectedHat, editMode } = useTreeForm();
  const { isMobile } = useMediaStyles();

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

  const { data: safeOwners } = useSafeDetails({
    safeAddress: safe,
    chainId,
    enabled: !!safe,
    editMode,
  });
  const eligibleSigners = useMemo(() => {
    if (!safeOwners || !selectedHat?.wearers) return [];

    const wearersLowercased = _.map(selectedHat.wearers, (wearer) =>
      _.toLower(wearer.id),
    );

    return _.filter(
      safeOwners,
      (owner) => !_.includes(wearersLowercased, _.toLower(owner)),
    );
  }, [safeOwners, selectedHat]);

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

  // TODO was {Key} the right icon here?
  return (
    <Flex gap={4} w='100%' justify='space-between' align='center'>
      <HStack spacing={4} align='start'>
        {imageUrl || authorityEnforcement.imageUri ? (
          <Image
            src={
              isIpfs
                ? ipfsUrl(imageUrl?.slice(7)) || ''
                : imageUrl || authorityEnforcement.imageUri
            }
            boxSize='24px'
            border='1px solid'
            borderColor='blackAlpha.300'
            borderRadius='full'
            alt='authority image'
          />
        ) : (
          <Icon as={HatIcon} boxSize={4} color='blackAlpha.700' />
        )}

        <Box textAlign='left'>
          <HStack>
            <Text
              size='sm'
              fontWeight={isExpanded ? 'medium' : 'normal'}
              noOfLines={2}
            >
              {currentLabel || label || 'New Authority'}
              {currentThresholdConfig && ` (${currentThresholdConfig} signers)`}
            </Text>
            {subLabel && (
              <Text size='xs' fontFamily='monospace' color='gray.700'>
                {subLabel}
              </Text>
            )}
          </HStack>
        </Box>
      </HStack>
      {!isMobile && localLink && validateURL(localLink) && (
        <ChakraNextLink isExternal href={localLink} display='block'>
          <Tooltip label={getHostnameFromURL(localLink)}>
            <HStack spacing={1}>
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
