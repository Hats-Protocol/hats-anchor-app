import {
  Avatar,
  Box,
  Circle,
  HStack,
  Icon,
  IconButton,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { BsInfoCircle } from 'react-icons/bs';
import { FaExternalLinkAlt } from 'react-icons/fa';

import ChakraNextLink from '@/components/atoms/ChakraNextLink';
import { AUTHORITIES } from '@/constants';
import { getHostnameFromURL, validateURL } from '@/lib/general';
import { ipfsUrl } from '@/lib/ipfs';
import { AuthorityType } from '@/types';

const AuthorityHeader = ({
  label,
  type,
  imageUrl,
  hideInfo,
  strategies,
  link,
}: {
  label?: string;
  type: AuthorityType;
  imageUrl?: string;
  hideInfo?: boolean;
  strategies?: string[];
  link?: string;
}) => {
  const isIpfs = imageUrl?.startsWith('ipfs://');

  return (
    <HStack spacing={4} w='full'>
      <Avatar
        size='md'
        src={
          isIpfs
            ? ipfsUrl(imageUrl?.slice(7)) || ''
            : imageUrl || '/icons/authority.svg'
        }
      />
      <Box textAlign='left'>
        <Tooltip label={label} placement='left' hasArrow>
          <Text fontSize='md' fontWeight='medium' noOfLines={2}>
            {label}
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
      {link && validateURL(link) && (
        <ChakraNextLink isExternal href={link} display='block'>
          <Tooltip label={getHostnameFromURL(link)}>
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
    </HStack>
  );
};

export default AuthorityHeader;
