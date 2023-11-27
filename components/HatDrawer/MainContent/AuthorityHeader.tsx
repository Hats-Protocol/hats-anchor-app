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

import { AUTHORITIES } from '@/constants';
import { ipfsUrl } from '@/lib/ipfs';
import { AuthorityType } from '@/types';

const AuthorityHeader = ({
  label,
  type,
  imageUrl,
  hideInfo,
  strategies,
}: {
  label?: string;
  type: AuthorityType;
  imageUrl?: string;
  hideInfo?: boolean;
  strategies?: string[];
}) => {
  const isIpfs = imageUrl?.startsWith('ipfs://');

  return (
    <HStack spacing={4} w='full'>
      <Avatar
        size='md'
        src={isIpfs ? ipfsUrl(imageUrl?.slice(7)) || '' : imageUrl}
      />
      <Box textAlign='left'>
        <Text fontSize='md' fontWeight='medium'>
          {label}
        </Text>
        <HStack>
          <Circle size='10px' bg={AUTHORITIES[type].color} />
          <Text fontSize='sm'>{AUTHORITIES[type].label}</Text>
          {!hideInfo && (
            <Tooltip
              label={
                strategies
                  ? `Automatically pulled in from Snapshot. Voting weight in ${strategies.length} strategies.`
                  : AUTHORITIES[type].info
              }
            >
              <IconButton
                aria-label='Info'
                icon={<Icon as={BsInfoCircle} />}
                size='xs'
                variant='ghost'
              />
            </Tooltip>
          )}
        </HStack>
      </Box>
    </HStack>
  );
};

export default AuthorityHeader;
