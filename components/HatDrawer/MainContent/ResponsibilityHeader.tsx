import {
  Avatar,
  Box,
  Flex,
  Icon,
  IconButton,
  Link,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { BsFileCheck } from 'react-icons/bs';
import { FaExternalLinkAlt } from 'react-icons/fa';

import { getHostnameFromURL } from '@/lib/general';
import { ipfsUrl } from '@/lib/ipfs';

const ResponsibilityHeader = ({
  label,
  imageUrl,
  link,
}: {
  label?: string;
  imageUrl?: string;
  link?: string;
}) => {
  const isIpfs = imageUrl?.startsWith('ipfs://');
  const hostname = getHostnameFromURL(link);

  return (
    <Flex alignItems='center' justifyContent='space-between' w='full'>
      {imageUrl ? (
        <Avatar
          size='md'
          src={isIpfs ? ipfsUrl(imageUrl?.slice(7)) || '' : imageUrl}
        />
      ) : (
        <Flex
          borderRadius='6px'
          border='1px solid var(--gray-300, #CBD5E0)'
          background='var(--gray-100, #EDF2F7)'
          minW={42}
          h={42}
          alignItems='center'
          justifyContent='center'
        >
          <Icon as={BsFileCheck} boxSize={4} color='gray.500' />
        </Flex>
      )}
      <Box flex={1} mx={4} minW={0} w='full'>
        <Tooltip label={label} placement='left' hasArrow>
          <Text
            fontSize='md'
            fontWeight='medium'
            noOfLines={2}
            textAlign='left'
          >
            {label || 'New Responsibility'}
          </Text>
        </Tooltip>
      </Box>
      {link && (
        <Link href={link} isExternal>
          <Tooltip label={hostname}>
            <IconButton
              as='a'
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
