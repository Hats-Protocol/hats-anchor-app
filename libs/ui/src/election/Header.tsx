import {
  AspectRatio,
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
import { useToast } from 'app-hooks';
import { hatLink } from 'app-utils';
import { useEligibility } from 'contexts';
import { useWearerDetails } from 'hats-hooks';
import _ from 'lodash';
import { FaCopy } from 'react-icons/fa';
import { useAccount } from 'wagmi';

import { ChakraNextLink, Markdown } from '../atoms';

const Header = () => {
  const toast = useToast();
  const { address } = useAccount();
  const { chainId, selectedHat, selectedHatDetails } = useEligibility();
  const { onCopy } = useClipboard(selectedHat?.id as string);

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

  return (
    <HStack w={{ base: '100%', md: '2xl' }} gap={10}>
      <ChakraNextLink
        href={hatLink({ chainId, hatId: selectedHat?.id })}
        boxSize={{ base: '65px', md: '120px' }}
        display={{ base: 'none', md: 'block' }}
        isExternal
      >
        <AspectRatio ratio={1}>
          <Image
            src={selectedHat?.imageUrl || '/icon.jpeg'}
            alt='hat image'
            loading='lazy'
            objectFit='cover'
            width='100%'
            border='1px solid'
            borderColor='gray.700'
            borderRadius='md'
          />
        </AspectRatio>
      </ChakraNextLink>
      <Stack spacing={1} w={{ base: '60%', md: 'full' }}>
        <Stack w='full' gap={1}>
          <HStack
            justifyContent='space-between'
            lineHeight={6}
            wrap={{ base: 'wrap', md: 'unset' }}
          >
            <Tooltip label={name || selectedHat?.details}>
              <Heading
                size='2xl'
                variant='medium'
                noOfLines={{ base: 2, md: 1 }}
              >
                {name || selectedHat?.details}
              </Heading>
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
                      title: 'Successfully copied hat ID to clipboard',
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
    </HStack>
  );
};

export default Header;
