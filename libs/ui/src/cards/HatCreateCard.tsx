import {
  Box,
  Flex,
  Heading,
  Icon,
  Image,
  Skeleton,
  Stack,
  Text,
} from '@chakra-ui/react';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useHatDetails, useHatDetailsField } from 'hats-hooks';
import dynamic from 'next/dynamic';
import { ipfsUrl } from 'utils';
import { Hex } from 'viem';

const WearerIcon = dynamic(() => import('icons').then((i) => i.WearerIcon));

const HatCreateCard = ({ id }: { id: Hex }) => {
  const { data } = useHatDetails({
    chainId: 10,
    hatId: id,
  });

  const { data: detailsField } = useHatDetailsField(data?.details);

  if (!data || !detailsField) return null;

  const { name } = detailsField.data;

  const { imageUri, currentSupply, maxSupply } = data;
  const imageUrl = ipfsUrl(imageUri?.slice(7));

  return (
    <Skeleton isLoaded={!!name && !!maxSupply && !!currentSupply}>
      <Flex
        direction='column'
        alignItems='center'
        justifyContent='center'
        backgroundColor='white'
        border='1px'
        borderColor='#4A5568'
        borderRadius='4px'
        boxShadow='0px 2px 4px -1px rgba(0, 0, 0, 0.06), 0px 4px 6px -1px rgba(0, 0, 0, 0.10)'
        w='300px'
      >
        <Stack width='100%' alignItems='center' position='relative'>
          <Box
            position='absolute'
            width='84px'
            left={-1}
            top={-1}
            height='84px'
            border='1px'
            borderColor='#4A5568'
            borderRadius='4px'
            zIndex={1}
            background='white'
          >
            <Image
              borderRadius='4px'
              alt='Hat'
              loading='lazy'
              src={
                imageUrl !== '' && imageUrl !== null ? imageUrl : '/icon.jpeg'
              }
            />
          </Box>
          <Flex
            direction='column'
            height='100%'
            width='70%'
            position='relative'
            marginLeft='30%'
          >
            <Flex
              direction='column'
              position='absolute'
              p={1}
              overflow='hidden'
            >
              <Text size='xs'>{hatIdDecimalToIp(BigInt(id))}</Text>
              <Heading variant='medium' size='lg'>
                {name}
              </Heading>
            </Flex>
          </Flex>

          <HatFooter wearers={currentSupply} total={maxSupply} />
        </Stack>
      </Flex>
    </Skeleton>
  );
};

const HatFooter = ({
  wearers,
  total,
}: {
  wearers: string | undefined;
  total: string | undefined;
}) => {
  return (
    <Flex
      marginTop='68px'
      width='100%'
      height='40px'
      borderTop='1px solid #4A5568'
      padding='10px'
      background='#FFFFF0'
      alignItems='center'
      justifyContent='space-between'
      borderBottomRadius={4}
    >
      <Flex gap={1} alignItems='center'>
        <Icon as={WearerIcon} boxSize={4} color='blackAlpha.700' />

        <Skeleton isLoaded={!!wearers}>
          <Text
            fontSize='15px'
            fontWeight='550'
            opacity='0.8'
            overflow='hidden'
            width='115px'
          >
            {`${wearers} Wallets`}
          </Text>
        </Skeleton>
      </Flex>
      <Skeleton isLoaded={!!total}>
        <Text
          display='inline-block'
          textAlign='right'
          minWidth='62px'
          opacity='0.6'
        >
          {`out of ${total}`}
        </Text>
      </Skeleton>
    </Flex>
  );
};

export default HatCreateCard;
