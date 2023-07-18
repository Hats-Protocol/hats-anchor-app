import {
  Flex,
  Heading,
  HStack,
  Icon,
  Image,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { FaBan, FaCheck, FaCode } from 'react-icons/fa';

import ChakraNextLink from '@/components/atoms/ChakraNextLink';
import { formatAddress } from '@/lib/general';
import { explorerUrl } from '@/lib/web3';

const StatusCard = ({
  statusName,
  statusData,
  statusCheck,
  isAContract,
  chainId,
}: {
  statusName: string;
  statusData: string;
  statusCheck: boolean;
  isAContract: boolean;
  chainId: number;
}) => (
  <Stack>
    <HStack justifyContent='space-between'>
      <Heading size='sm' fontWeight='medium' textTransform='uppercase'>
        {statusName}
      </Heading>
      <Tooltip label={statusData} shouldWrapChildren>
        <ChakraNextLink
          href={`${explorerUrl(chainId)}/address/${statusData}`}
          isExternal
        >
          <HStack>
            {isAContract ? (
              <Icon as={FaCode} ml={2} w={4} h={4} color='gray.500' />
            ) : (
              <Image
                src='/icons/wearers.svg'
                alt='Wearers'
                w={4}
                h={4}
                color='gray.500'
              />
            )}
            <Text color='gray.500' fontSize='sm'>
              {formatAddress(statusData)}
            </Text>
          </HStack>
        </ChakraNextLink>
      </Tooltip>
    </HStack>
    <Flex justifyContent='space-between'>
      <HStack>
        <Text>Is this {statusName.toLowerCase()}?</Text>
      </HStack>

      <HStack color={statusCheck ? 'green.500' : 'red.500'} ml={2}>
        <Text>{statusCheck ? 'Yes' : 'No'}</Text>
        {statusCheck ? <FaCheck /> : <FaBan />}
      </HStack>
    </Flex>
  </Stack>
);

export default StatusCard;
