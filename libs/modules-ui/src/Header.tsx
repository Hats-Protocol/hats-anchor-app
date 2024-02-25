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
import { useEligibility } from 'contexts';
import { useWearerDetails } from 'hats-hooks';
import { useMediaStyles, useToast } from 'hooks';
import _ from 'lodash';
import { ChakraNextLink, CopyHash, Markdown } from 'ui';
import { hatLink } from 'utils';
import { useAccount } from 'wagmi';

const Header = () => {
  const toast = useToast();
  const { address } = useAccount();
  const { chainId, selectedHat, selectedHatDetails } = useEligibility();
  const { onCopy } = useClipboard(selectedHat?.id as string);
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

  return (
    <HStack w={{ base: '100%', md: '2xl' }} h={{ md: '120px' }} gap={10}>
      <AspectRatio
        ratio={1}
        boxSize='120px'
        display={{ base: 'none', md: 'block' }}
      >
        <ChakraNextLink
          href={hatLink({ chainId, hatId: selectedHat?.id, isMobile })}
          isExternal
        >
          <Image
            src={selectedHat?.imageUrl || '/icon.jpeg'}
            alt='hat image'
            loading='lazy'
            objectFit='cover'
            width='100%'
            border='1px solid'
            borderColor='gray.700'
            borderRadius='md'
            bg='white'
          />
        </ChakraNextLink>
      </AspectRatio>

      <Stack spacing={1} w={{ base: '100%', md: '80%' }}>
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
                  as={CopyHash}
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
          <Badge colorScheme='purple'>Level {levelAtLocalTree}</Badge>
        </HStack>
      </Stack>
    </HStack>
  );
};

export default Header;
