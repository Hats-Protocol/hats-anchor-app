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
import { Authority } from 'hats-types';
import { useMediaStyles } from 'hooks';
import _ from 'lodash';
import { BsBoxArrowUpRight, BsCheck2Square } from 'react-icons/bs';
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
          boxSize='24px'
          border='1px solid'
          borderColor='blackAlpha.300'
          borderRadius='full'
          alt='authority image'
        />
      ) : (
        <Flex
          borderRadius='full'
          boxSize='24px'
          alignItems='center'
          justifyContent='center'
          bg='gray.200'
          border='1px solid'
          borderColor='gray.300'
        >
          <Icon as={BsCheck2Square} boxSize={3} color='gray.500' />
        </Flex>
      )}
      <Box flex={1} minW={0} w='full'>
        <Text
          size='sm'
          // TODO ideally this is a heading when expanded
          fontWeight={isExpanded ? 'bold' : 'normal'}
          noOfLines={2}
          textAlign='left'
        >
          {currentLabel || label || 'New Responsibility'}
        </Text>
      </Box>
      {!isMobile && (currentLink || link) && (
        // TODO convert to text
        <Link href={currentLink || link} isExternal>
          <Tooltip label={hostname}>
            <IconButton
              as='span'
              icon={<Icon as={BsBoxArrowUpRight} />}
              variant='ghost'
              aria-label='Responsibility Link'
              color='blue.500'
              size='xs'
            />
          </Tooltip>
        </Link>
      )}
    </HStack>
  );
};

export default ResponsibilityHeader;
