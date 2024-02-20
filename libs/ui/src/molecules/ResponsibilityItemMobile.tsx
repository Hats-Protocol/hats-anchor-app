import {
  Box,
  HStack,
  Icon,
  IconButton,
  Image,
  Link,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { Authority } from 'hats-types';
import { BsFileCheck } from 'react-icons/bs';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { getHostnameFromURL, ipfsUrl } from 'utils';

const ResponsibilitiesItemMobile = ({
  responsibility,
}: {
  responsibility?: Authority;
}) => {
  const { label, link, imageUrl } = responsibility || {};

  const localImageUrl = imageUrl;
  const isIpfs = localImageUrl?.startsWith('ipfs://');
  const hostname = getHostnameFromURL(link);

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
        <HStack
          borderRadius='full'
          border='1px solid var(--gray-300, #CBD5E0)'
          background='var(--gray-100, #EDF2F7)'
          boxSize='24px'
          alignItems='center'
          justifyContent='center'
        >
          <Icon as={BsFileCheck} boxSize={4} color='gray.500' />
        </HStack>
      )}
      <Box flex={1} minW={0} w='full'>
        <Text size='md' variant='medium' noOfLines={1}>
          {label || 'New Responsibility'}
        </Text>
      </Box>
      {link && (
        <Link href={link} isExternal>
          <Tooltip label={hostname}>
            <IconButton
              as='span'
              icon={<Icon as={FaExternalLinkAlt} />}
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

export default ResponsibilitiesItemMobile;
