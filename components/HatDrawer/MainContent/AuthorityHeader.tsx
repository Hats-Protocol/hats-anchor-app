import {
  Avatar,
  Box,
  Circle,
  Flex,
  HStack,
  Icon,
  IconButton,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import _ from 'lodash';
import { BsInfoCircle } from 'react-icons/bs';
import { FaExternalLinkAlt } from 'react-icons/fa';

import ChakraNextLink from '@/components/atoms/ChakraNextLink';
import { AUTHORITIES } from '@/constants';
import { getHostnameFromURL, validateURL } from '@/lib/general';
import { ipfsUrl } from '@/lib/ipfs';
import { Authority, AuthorityType } from '@/types';

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
  strategies?: string[];
  link?: string;
  editingItem?: Authority;
}) => {
  const {
    label: currentLabel,
    imageUrl: currentImageUrl,
    link: currentLink,
  } = _.pick(editingItem, ['label', 'imageUrl', 'link']);
  const localImageUrl = editingItem ? currentImageUrl : imageUrl;
  const isIpfs = localImageUrl?.startsWith('ipfs://');
  const localLink = editingItem ? currentLink : link;

  return (
    <Flex gap={4} w='100%' justify='space-between' align='center'>
      <HStack spacing={4}>
        <Avatar
          size='md'
          src={
            isIpfs
              ? ipfsUrl(localImageUrl?.slice(7)) || ''
              : localImageUrl || '/icons/authority.svg'
          }
        />
        <Box textAlign='left'>
          <Tooltip label={currentLabel || label} placement='left' hasArrow>
            <Text fontSize='md' fontWeight='medium' noOfLines={2}>
              {currentLabel || label || 'New Authority'}
            </Text>
          </Tooltip>

          {!hideInfo ? (
            <Tooltip
              label={
                strategies
                  ? `Automatically pulled in from Snapshot. Voting weight in ${strategies.length} strategies.`
                  : AUTHORITIES[type].info
              }
              placement='right'
              hasArrow
              shouldWrapChildren
            >
              <HStack>
                <Circle size='10px' bg={AUTHORITIES[type].color} />
                <Text fontSize='sm'>{AUTHORITIES[type].label}</Text>
                <Icon as={BsInfoCircle} boxSize='12px' cursor='pointer' />
              </HStack>
            </Tooltip>
          ) : (
            <HStack>
              <Circle size='10px' bg={AUTHORITIES[type].color} />
              <Text fontSize='sm'>{AUTHORITIES[type].label}</Text>
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
