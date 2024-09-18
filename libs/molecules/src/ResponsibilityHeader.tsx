'use client';

import {
  Box,
  Flex,
  HStack,
  Icon,
  IconButton,
  Image,
  Link,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { useMediaStyles } from 'hooks';
import _ from 'lodash';
import posthog from 'posthog-js';
import { BsBoxArrowUpRight, BsCheck2Square } from 'react-icons/bs';
import { Authority } from 'types';
import { getHostnameFromURL, ipfsUrl } from 'utils';

const ResponsibilityHeader = ({
  label,
  imageUrl,
  link,
  editingItem,
  isExpanded,
}: {
  label?: string;
  imageUrl?: string;
  link?: string;
  editingItem?: Authority;
  isExpanded?: boolean;
}) => {
  const { isMobile } = useMediaStyles();

  const localImageUrl = editingItem ? editingItem.imageUrl : imageUrl;
  const isIpfs = localImageUrl?.startsWith('ipfs://');
  const { label: currentLabel, link: currentLink } = _.pick(editingItem, [
    'label',
    'link',
  ]);
  const hostname = getHostnameFromURL(currentLink || link);

  return (
    <HStack w='100%' align='center'>
      {localImageUrl ? (
        <Image
          src={isIpfs ? ipfsUrl(localImageUrl?.slice(7)) || '' : localImageUrl}
          boxSize={6}
          borderRadius='full'
          alt='authority image'
        />
      ) : (
        <Flex
          borderRadius='full'
          boxSize={6}
          alignItems='center'
          justifyContent='center'
          bg='white'
        >
          <Icon as={BsCheck2Square} boxSize={4} color='gray.500' />
        </Flex>
      )}
      <Box flex={1} minW={0} w='full'>
        <Text
          // TODO ideally this is a heading when expanded
          // eslint-disable-next-line no-nested-ternary
          fontWeight={isExpanded ? (isMobile ? 'bold' : 'medium') : 'normal'}
          noOfLines={2}
          textAlign='left'
        >
          {currentLabel || label || 'New Responsibility'}
        </Text>
      </Box>
      {!isMobile && (currentLink || link) && (
        // TODO convert to text
        <Link
          href={currentLink || link}
          isExternal
          onClick={() => {
            posthog.capture('Clicked Responsibility Link', {
              responsibility: label,
              link: currentLink || link,
              label: hostname,
            });
          }}
        >
          <Tooltip label={hostname}>
            <IconButton
              as='span'
              icon={<Icon as={BsBoxArrowUpRight} />}
              variant='ghost'
              aria-label='Responsibility Link'
              color='Functional-LinkPrimary'
              size='xs'
            />
          </Tooltip>
        </Link>
      )}
    </HStack>
  );
};

export default ResponsibilityHeader;
