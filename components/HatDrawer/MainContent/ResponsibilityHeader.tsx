import {
  Avatar,
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Link,
  Text,
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
    <HStack spacing={4} w='full'>
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
      <Box textAlign='left'>
        <Text fontSize='md' fontWeight='medium' isTruncated maxWidth='30ch'>
          {label || 'New Responsibility'}
        </Text>
      </Box>
      {hostname && (
        <Link href={link} ml='auto' isExternal>
          <Button
            colorScheme='blue'
            color='blue.500'
            variant='outline'
            borderColor='blue.500'
          >
            <Text fontSize='md' fontWeight='medium'>
              {hostname}
            </Text>
          </Button>
        </Link>
      )}
    </HStack>
  );
};

export default ResponsibilityHeader;
