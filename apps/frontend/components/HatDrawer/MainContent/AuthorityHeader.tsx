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
import { AUTHORITIES, AUTHORITY_TYPES } from 'app-constants';
import { getHostnameFromURL, ipfsUrl, validateURL } from 'app-utils';
import { Authority, AuthorityType, SnapshotStrategy } from 'hats-types';
import _ from 'lodash';
import { BsInfoCircle } from 'react-icons/bs';
import { FaExternalLinkAlt } from 'react-icons/fa';

import ChakraNextLink from '../../atoms/ChakraNextLink';

const AuthorityHeader = ({
  label,
  type,
  imageUrl,
  hideInfo,
  strategies,
  link,
  editingItem,
}: {
  label?: string;
  type: AuthorityType;
  imageUrl?: string;
  hideInfo?: boolean;
  strategies?: SnapshotStrategy[];
  link?: string;
  editingItem?: Authority;
}) => {
  const {
    label: currentLabel,
    imageUrl: currentImageUrl,
    link: currentLink,
  } = _.pick(editingItem, ['label', 'imageUrl', 'link']);

  const localLink = editingItem ? currentLink : link;
  const authority = AUTHORITIES[type];

  // set current image
  let localImageUrl = imageUrl;
  if (authority) localImageUrl = authority.imageUri;
  if (editingItem) localImageUrl = currentImageUrl;
  const isIpfs = localImageUrl?.startsWith('ipfs://');

  return (
    <Flex gap={4} w='100%' justify='space-between' align='center'>
      <HStack spacing={4}>
        <Image
          src={
            isIpfs
              ? ipfsUrl(localImageUrl?.slice(7)) || ''
              : localImageUrl || authority.imageUri || '/icons/authority.svg'
          }
          boxSize='50px'
          border='1px solid'
          borderColor='blackAlpha.300'
          borderRadius='full'
          alt='authority image'
        />
        <Box textAlign='left'>
          <Text fontSize='md' fontWeight='medium' noOfLines={1}>
            {currentLabel || label || 'New Authority'}
          </Text>

          {!hideInfo ? (
            <Tooltip
              label={
                strategies
                  ? `Automatically pulled in from Snapshot. Voting weight in ${_.size(
                      strategies,
                    )} strateg${_.size(strategies) === 1 ? 'y' : 'ies'}.`
                  : authority.info
              }
              placement='right'
              hasArrow
              shouldWrapChildren
            >
              <HStack>
                <Circle size='10px' bg={authority.color} />
                <Text fontSize='sm'>{authority.label}</Text>
                <Icon as={BsInfoCircle} boxSize='12px' cursor='pointer' />
              </HStack>
            </Tooltip>
          ) : (
            <HStack>
              <Circle size='10px' bg={authority.color} />
              <Text fontSize='sm'>{authority.label}</Text>
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

export default AuthorityHeader;
