'use client';

import {
  Box,
  Card,
  CardBody,
  Flex,
  Heading,
  HStack,
  Icon,
  Stack,
  Text,
} from '@chakra-ui/react';
import { treeIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { Tree } from '@hatsprotocol/sdk-v1-subgraph';
import { useHatDetailsField } from 'hats-hooks';
import { useMediaStyles } from 'hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
// import { BsPeopleFill } from 'react-icons/bs';
import { AppHat } from 'types';
import { ChakraNextLink } from 'ui';
import { removeInactiveHatsAndDescendants } from 'utils';

const HatIcon = dynamic(() => import('icons').then((mod) => mod.HatIcon));

// TODO migrate Top Hat image to LazyImage

const TreeStats = ({ tree }: { tree: Tree }) => {
  const activeHats = removeInactiveHatsAndDescendants(tree?.hats);
  // const activeWearers = _.size(_.uniq(_.flatten(_.map(activeHats, 'wearers'))));

  return (
    <HStack>
      <HStack spacing={1} color='blue.700'>
        <Icon as={HatIcon} boxSize={3} />
        <Text size='xs' fontWeight='medium'>
          {_.size(activeHats)}
        </Text>
      </HStack>
      {/* <HStack spacing={1} color='blue.700'>
        <Icon as={BsPeopleFill} boxSize={3} />
        <Text size='xs' fontWeight='medium'>
          {activeWearers}
        </Text>
      </HStack> */}
    </HStack>
  );
};

const TreeListCard = ({
  tree,
  topHat,
  topHatImage,
}: {
  tree: Tree;
  topHat: AppHat;
  topHatImage: AppHat | undefined;
}) => {
  const { data: hatDetails } = useHatDetailsField(_.get(topHat, 'details'));
  const { isMobile } = useMediaStyles();

  const hatName =
    hatDetails?.type === '1.0'
      ? _.get(hatDetails, 'data.name')
      : _.get(topHat, 'details');

  return (
    <ChakraNextLink
      href={`/trees/${_.get(tree, 'chainId')}/${treeIdHexToDecimal(
        _.get(tree, 'id'),
      )}`}
      key={`${_.get(tree, 'chainId')}-${_.get(tree, 'id')}`}
    >
      <Card overflow='hidden'>
        <CardBody
          p={isMobile ? '0 !important' : 6}
          w='100%'
          h='100%'
          border={isMobile ? '1px solid #4A5568' : ''}
          display='flex'
          alignItems='center'
          justifyContent='center'
          flexDirection='column'
          borderRadius={6}
        >
          <Flex justify='space-between' align='center' w='100%'>
            <HStack
              h={{ base: 85, sm: '100px' }}
              w={{ base: '100%', md: '90%' }}
              justify='left'
              align={{
                base: 'flex-start',
                sm: 'center',
              }}
              pr={2}
              spacing={{
                base: 2,
                sm: 4,
              }}
            >
              {/* TOP HAT IMAGE */}
              <Box
                bgImage={
                  _.get(topHatImage, 'imageUrl')
                    ? `url('${_.get(topHatImage, 'imageUrl')}')`
                    : `url('/icon.jpeg')`
                }
                bgSize='cover'
                bgPosition='center'
                w='85px'
                h='85px'
                borderRight={isMobile ? '1px solid #4A5568' : ''}
                border={isMobile ? '' : '1px solid #4A5568'}
                borderRadius={5}
              />
              <Flex
                h='100%'
                direction='column'
                justify={{ base: 'start', md: 'space-around' }}
                w={{ base: '80%', md: '50%' }}
              >
                {/* TOP HAT INFO */}
                {isMobile ? (
                  <Flex
                    direction='column'
                    justify='space-between'
                    h='100%'
                    w='100%'
                    py={2}
                  >
                    <Heading
                      size='md'
                      noOfLines={2}
                      maxW={{ base: '270px', md: 'auto' }}
                    >
                      {hatName}
                    </Heading>
                    <Flex justify='space-between' w='100%'>
                      <Text size='xs'>
                        #{treeIdHexToDecimal(_.get(tree, 'id'))}
                      </Text>
                      <TreeStats tree={tree} />
                    </Flex>
                  </Flex>
                ) : (
                  <Stack spacing={1} pt={0}>
                    <Text size='xs'>
                      #{treeIdHexToDecimal(_.get(tree, 'id'))}
                    </Text>
                    <Heading size='sm' noOfLines={2}>
                      {hatName}
                    </Heading>
                  </Stack>
                )}
                {/* TREE STATS */}
                {!isMobile && <TreeStats tree={tree} />}
              </Flex>
            </HStack>
          </Flex>
        </CardBody>
      </Card>
    </ChakraNextLink>
  );
};

export default TreeListCard;
