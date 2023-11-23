import {
  Avatar,
  Box,
  Button,
  Flex,
  Icon,
  Link,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { BsFileCheck } from 'react-icons/bs';

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
          src={isIpfs ? ipfsUrl(imageUrl?.slice(7)) : imageUrl}
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
        <Tooltip label={label} placement='top' hasArrow>
          <Text fontSize='md' fontWeight='medium' isTruncated>
            {label || 'New Responsibility'}
          </Text>
        </Tooltip>
      </Box>
      {hostname && (
        <Link href={link} isExternal>
          <Button
            variant='outlineMatch'
            borderColor='blue.500'
            color='blue.500'
          >
            <Text fontSize='md' fontWeight='medium'>
              {hostname}
            </Text>
          </Button>
        </Link>
      )}
    </Flex>
  );
};

export default ResponsibilityHeader;
