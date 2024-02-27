import {
  Badge,
  Box,
  Flex,
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
import { useMediaStyles, useToast } from 'hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { FaCopy } from 'react-icons/fa';
import { useAccount } from 'wagmi';

const Markdown = dynamic(() => import('ui').then((mod) => mod.Markdown));

const HatDetails = () => {
  const toast = useToast();
  const { address } = useAccount();
  const { chainId, selectedHat, selectedHatDetails } = useEligibility();
  const { onCopy } = useClipboard(selectedHat?.id || '');
  const { isMobile } = useMediaStyles();

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
  console.log("_.get(selectedHat, 'imageUrl')", _.get(selectedHat, 'imageUrl'));

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
          // Setting the height to null or auto to ensure the image keeps its aspect ratio
          // You can adjust this to ensure it's square, or manage via aspect ratio
          height='auto' // Adjust this value as needed
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
      <Stack w='full' spacing={1} px={4}>
        <HStack spacing={4} align='end' pt={isMobile ? 0 : 8}>
          <Flex
            justify='space-between'
            gap={2}
            direction={{ base: 'column', md: 'row' }}
            maxW='60%'
          >
            <Tooltip label={name || selectedHat?.details}>
              <Heading noOfLines={{ base: 2, md: 1 }}>
                {name || selectedHat?.details}
              </Heading>
            </Tooltip>

            <HStack>
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
                    title: 'Successfully copied hat ID to clipboard',
                  });
                }}
              />
            </HStack>
          </Flex>
        </HStack>
        {description && (
          <Box opacity={0.6}>
            <Markdown>{description}</Markdown>
          </Box>
        )}
      </Stack>
    </Stack>
  );
};

export default HatDetails;
