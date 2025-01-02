'use client';

import { Box, Flex, Heading, HStack, Image, Stack } from '@chakra-ui/react';
import { NETWORK_IMAGES } from '@hatsprotocol/constants';
import { useTreasury } from 'contexts';
import { get } from 'lodash';
import { chainsMap, ipfsUrl } from 'utils';

const TreeOverview = () => {
  const { treeDetails, chainId } = useTreasury();
  const topHatDetails = get(treeDetails, 'hats[0].detailsMetadata');
  const topHatName = topHatDetails ? get(JSON.parse(topHatDetails), 'data.name') : get(treeDetails, 'hats[0].details');
  const topHatImage = get(treeDetails, 'hats[0].nearestImage');
  const chain = chainsMap(chainId);

  if (!chainId) return null;

  return (
    <Flex py={16} justify='center' bg='blackAlpha.100'>
      <Stack justifyContent='center'>
        <HStack mx='auto'>
          <Box w={7}>&nbsp;</Box>
          <Box backgroundColor='white'>
            <Box
              backgroundImage={topHatImage ? ipfsUrl(topHatImage) : '/icon.jpeg'}
              backgroundSize='cover'
              boxSize='100px'
              borderRadius='lg'
              border='2px solid black'
            />
          </Box>
          <Image src={NETWORK_IMAGES[chainId]} alt={`${chain?.name}`} boxSize={7} />
        </HStack>
        <Heading textAlign='center'>{topHatName}</Heading>
        {/* <Text textAlign='center' fontStyle='italic'>
              Roles with budgets
            </Text> */}
      </Stack>
    </Flex>
  );
};

export default TreeOverview;
