import {
  Badge,
  Box,
  Flex,
  HStack,
  Icon,
  Stack,
  Text,
  Tooltip,
  useClipboard,
} from '@chakra-ui/react';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
import { FaCopy } from 'react-icons/fa';
import { useAccount } from 'wagmi';

import Markdown from '@/components/atoms/Markdown';
import { MUTABILITY, STATUS } from '@/constants';
import { useTreeForm } from '@/contexts/TreeFormContext';
import useToast from '@/hooks/useToast';
import useWearerDetails from '@/hooks/useWearerDetails';
import { decimalId } from '@/lib/hats';

const Header = () => {
  const toast = useToast();
  const { address } = useAccount();
  const { chainId, selectedHat, selectedHatDetails, editMode } = useTreeForm();
  const { onCopy } = useClipboard(decimalId(selectedHat?.id));

  const { name, description } = _.pick(selectedHatDetails, [
    'name',
    'description',
  ]);

  const { data: wearer } = useWearerDetails({
    wearerAddress: address,
    chainId,
    editMode,
  });
  const isCurrentWearer = _.includes(_.map(wearer, 'id'), selectedHat?.id);

  const levelAtLocalTree = selectedHat?.levelAtLocalTree || 0;
  const mutableStatus = selectedHat?.mutable
    ? MUTABILITY.MUTABLE
    : MUTABILITY.IMMUTABLE;
  const activeStatus = selectedHat?.status ? STATUS.ACTIVE : STATUS.INACTIVE;

  return (
    <Stack spacing={4}>
      <Flex align='start' justify='space-between'>
        <Stack w='full' spacing={1}>
          <HStack justifyContent='space-between'>
            <Tooltip label={name || selectedHat?.details}>
              <Text fontSize={24} isTruncated fontWeight='semibold'>
                {name || selectedHat?.details}
              </Text>
            </Tooltip>
            {selectedHat?.id && (
              <HStack>
                <Text whiteSpace='nowrap'>Hat ID:</Text>
                <Text color='blue.500'>
                  {hatIdDecimalToIp(BigInt(selectedHat.id))}
                </Text>
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
            )}
          </HStack>
          {description && (
            <Box opacity={0.6}>
              <Markdown>{description}</Markdown>
            </Box>
          )}
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
