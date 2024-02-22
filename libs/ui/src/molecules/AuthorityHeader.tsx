import {
  Box,
  Flex,
  HStack,
  Icon,
  IconButton,
  Image,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { AUTHORITY_ENFORCEMENT } from '@hatsprotocol/constants';
import { useTreeForm } from 'contexts';
import { Authority } from 'hats-types';
import { useSafeDetails } from 'hooks';
import _ from 'lodash';
import { useMemo } from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';
import {
  authorityImageHandler,
  getHostnameFromURL,
  ipfsUrl,
  validateURL,
} from 'utils';

import { ChakraNextLink } from '../atoms';

const AuthorityHeader = ({ authority, editingItem }: AuthorityHeaderProps) => {
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

  return (
    <Flex gap={4} w='100%' justify='space-between' align='center'>
      <HStack spacing={3}>
        <Image
          src={
            isIpfs
              ? ipfsUrl(imageUrl?.slice(7)) || ''
              : imageUrl ||
                authorityEnforcement.imageUri ||
                '/icons/authority.svg'
          }
          boxSize='24px'
          border='1px solid'
          borderColor='blackAlpha.300'
          borderRadius='full'
          alt='authority image'
        />
        <Box textAlign='left'>
          <HStack>
            <Text size='sm' fontWeight='normal' noOfLines={2}>
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
}

export default AuthorityHeader;
