import {
  Badge,
  Flex,
  HStack,
  Icon,
  Stack,
  Text,
  Tooltip,
  useClipboard,
} from '@chakra-ui/react';
import { FaCopy } from 'react-icons/fa';

import { MUTABILITY, STATUS } from '@/constants';
import useToast from '@/hooks/useToast';
import { decimalId, prettyIdToIp } from '@/lib/hats';

const Header = ({
  name,
  description,
  mutableStatus,
  activeStatus,
  isCurrentWearer,
  hatId,
  prettyId,
  levelAtLocalTree,
}: {
  name: string;
  description: string;
  mutableStatus: string;
  activeStatus: string;
  isCurrentWearer: boolean;
  hatId: string;
  prettyId: string;
  levelAtLocalTree: number;
}) => {
  const toast = useToast();
  const { onCopy } = useClipboard(decimalId(hatId));

  return (
    <Stack spacing={4}>
      <Flex align='start' justify='space-between'>
        <Stack w='full' spacing={1}>
          <HStack justifyContent='space-between'>
            <Tooltip label={name} aria-label='A tooltip'>
              <Text fontSize={24} isTruncated fontWeight={600}>
                {name}
              </Text>
            </Tooltip>
            <HStack>
              <Text whiteSpace='nowrap'>Hat ID:</Text>
              <Text color='blue.500'>{prettyIdToIp(prettyId)}</Text>
              <Icon
                as={FaCopy}
                color='blue.500'
                cursor='pointer'
                onClick={() => {
                  onCopy();
                  toast.info({
                    title: 'Successfully copied Hat id to clipboard',
                  });
                }}
              />
            </HStack>
          </HStack>
          <Text opacity={0.6}>{description}</Text>
        </Stack>
      </Flex>
      <HStack>
        {isCurrentWearer && <Badge colorScheme='green'>My Hat</Badge>}
        <Badge
          colorScheme={mutableStatus === MUTABILITY.MUTABLE ? 'blue' : 'red'}
        >
          {mutableStatus}
        </Badge>
        <Badge colorScheme={activeStatus === STATUS.ACTIVE ? 'green' : 'red'}>
          {activeStatus}
        </Badge>
        <Badge>Level {levelAtLocalTree}</Badge>
      </HStack>
    </Stack>
  );
};

export default Header;
