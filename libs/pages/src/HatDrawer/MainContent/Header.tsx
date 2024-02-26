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
import { useTreeForm } from 'contexts';
import { useWearerDetails } from 'hats-hooks';
import { useMediaStyles, useToast } from 'hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { useAccount } from 'wagmi';

const Markdown = dynamic(() => import('ui').then((mod) => mod.Markdown));
const CopyHash = dynamic(() => import('ui').then((mod) => mod.CopyHash));

const Header = () => {
  const toast = useToast();
  const { address } = useAccount();
  const { chainId, selectedHat, selectedHatDetails, editMode, treeToDisplay } =
    useTreeForm();
  const { onCopy } = useClipboard(selectedHat?.id || '');
  const { isMobile } = useMediaStyles();

  const { name, description } = _.pick(selectedHatDetails, [
    'name',
    'description',
  ]);
  const imageUrl = _.get(
    _.find(treeToDisplay, { id: selectedHat?.id }),
    'imageUrl',
  );

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

  if (!selectedHat) return null;

  return (
    <Stack spacing={4} px={{ base: 4, md: 10 }} pb={4} bg='white'>
      <Flex align='start' justify='space-between'>
        <Stack w='full' spacing={1}>
          <HStack
            spacing={4}
            minH={{ base: '150px', md: 'auto' }}
            pt={{ md: '50px' }}
            align='end'
          >
            {isMobile && (
              <Box
                boxSize='120px'
                borderRadius='md'
                overflow='hidden'
                objectFit='contain'
                border='1px solid'
                borderColor='blackAlpha.200'
              >
                <Image
                  loading='lazy'
                  src={
                    (editMode && imageUrl) ||
                    _.get(selectedHat, 'imageUrl') ||
                    '/icon.jpeg'
                  }
                  alt='hat image'
                  background='white'
                  objectFit='cover'
                  boxSize='122px'
                />
              </Box>
            )}

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
            </Flex>
          </HStack>
          {description && (
            <Box opacity={0.6}>
              <Markdown>{description}</Markdown>
            </Box>
          )}
        </Stack>
      </Flex>
      <Flex justify={isMobile ? 'center' : 'start'}>
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
      </Flex>
    </Stack>
  );
};

export default Header;
