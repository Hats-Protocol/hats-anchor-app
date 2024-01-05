import {
  Box,
  Flex,
  Icon,
  IconButton,
  Image,
  Link,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { getHostnameFromURL, ipfsUrl } from 'app-utils';
import { Authority } from 'hats-types';
import _ from 'lodash';
import { BsFileCheck } from 'react-icons/bs';
import { FaExternalLinkAlt } from 'react-icons/fa';

const ResponsibilityHeader = ({
  label,
  imageUrl,
  link,
  editingItem,
}: {
  label?: string;
  imageUrl?: string;
  link?: string;
  editingItem?: Authority;
}) => {
  const localImageUrl = editingItem ? editingItem.imageUrl : imageUrl;
  const isIpfs = localImageUrl?.startsWith('ipfs://');
  const { label: currentLabel, link: currentLink } = _.pick(editingItem, [
    'label',
    'link',
  ]);
  const hostname = getHostnameFromURL(currentLink || link);

  return (
    <Flex alignItems='center' justifyContent='space-between' w='full' gap={4}>
      {localImageUrl ? (
        <Image
          boxSize='50px'
          src={isIpfs ? ipfsUrl(localImageUrl?.slice(7)) || '' : localImageUrl}
          borderRadius='full'
          border='2px solid'
          borderColor='gray.300'
          alt='responsibility image'
        />
      ) : (
        <Flex
          borderRadius='6px'
          border='1px solid var(--gray-300, #CBD5E0)'
          background='var(--gray-100, #EDF2F7)'
          boxSize='45px'
          mx='2px'
          alignItems='center'
          justifyContent='center'
        >
          <Icon as={BsFileCheck} boxSize={4} color='gray.500' />
        </Flex>
      )}
      <Box flex={1} minW={0} w='full'>
        <Text fontSize='md' fontWeight='medium' noOfLines={1} textAlign='left'>
          {currentLabel || label || 'New Responsibility'}
        </Text>
      </Box>
      {(currentLink || link) && (
        <Link href={currentLink || link} isExternal>
          <Tooltip label={hostname}>
            <IconButton
              as='span'
              icon={<Icon as={FaExternalLinkAlt} />}
              variant='outlineMatch'
              aria-label='Responsibility Link'
              borderColor='blue.500'
              color='blue.500'
              size='sm'
            />
          </Tooltip>
        </Link>
      )}
      {/* {hostname && (
        <Link href={link} isExternal>
          <Button
            variant='outlineMatch'
            borderColor='blue.500'
            color='blue.500'
            size='sm'
          >
            <Text fontSize='md' fontWeight='medium'>
              {hostname}
            </Text>
          </Button>
        </Link>
      )} */}
    </Flex>
  );
};

export default ResponsibilityHeader;
