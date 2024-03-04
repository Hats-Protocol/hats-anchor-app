import {
  Badge,
  Box,
  Heading,
  HStack,
  Icon,
  Image,
  Stack,
  Text,
  Tooltip,
  useClipboard,
} from '@chakra-ui/react';
import { MUTABILITY, STATUS } from '@hatsprotocol/constants';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useEligibility } from 'contexts';
import { useWearerDetails } from 'hats-hooks';
import { useToast } from 'hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { useAccount } from 'wagmi';

import Conditions from './Conditions';

const Markdown = dynamic(() => import('ui').then((mod) => mod.Markdown));
const CopyHash = dynamic(() => import('ui').then((mod) => mod.CopyHash));

const HatDetails = ({
  isSigned,
  setIsSigned,
}: {
  isSigned: boolean;
  setIsSigned: (val: boolean) => void;
}) => {
  const toast = useToast();
  const { address } = useAccount();
  const { chainId, selectedHat, selectedHatDetails } = useEligibility();
  const { onCopy } = useClipboard(selectedHat?.id || '');

  const { name, description } = _.pick(selectedHatDetails, [
    'name',
    'description',
  ]);

  const { data: wearer } = useWearerDetails({
    wearerAddress: address,
    chainId,
  });
  const isCurrentWearer = _.includes(_.map(wearer, 'id'), selectedHat?.id);

  const levelAtLocalTree = selectedHat?.levelAtLocalTree || 0;
  const mutableStatus = selectedHat?.mutable
    ? MUTABILITY.MUTABLE
    : MUTABILITY.IMMUTABLE;
  const activeStatus = selectedHat?.status ? STATUS.ACTIVE : STATUS.INACTIVE;

  if (!selectedHat) return null;

  return (
    <Stack spacing={4} px={{ base: 0, md: 10 }}>
      <Box width='100%'>
        <Image
          src={_.get(selectedHat, 'imageUrl') || '/icon.jpeg'}
          alt='Hat image'
          background='white'
          objectFit='cover'
          width='100%'
          height='auto'
        />
        <HStack mt={-2} pl={4}>
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
      </Box>
      <Stack w='full' px={4} pb={100}>
        <HStack justify='space-between' gap={2} w='full' alignItems='baseline'>
          <Tooltip label={name || selectedHat?.details}>
            <Heading noOfLines={{ base: 2, md: 1 }}>
              {name || selectedHat?.details}
            </Heading>
          </Tooltip>

          <HStack>
            <Text color='blue.500' fontSize='xs'>
              {hatIdDecimalToIp(BigInt(selectedHat.id))}
            </Text>
            <Icon
              as={CopyHash}
              color='blue.500'
              cursor='pointer'
              h='12px'
              onClick={() => {
                onCopy();
                toast.info({
                  title: 'Successfully copied hat ID to clipboard',
                });
              }}
            />
          </HStack>
        </HStack>
        {description && (
          <Markdown smallFont collapse maxHeight={70}>
            {description}
          </Markdown>
        )}

        <Conditions isSigned={isSigned} setIsSigned={setIsSigned} />
      </Stack>
    </Stack>
  );
};

export default HatDetails;
