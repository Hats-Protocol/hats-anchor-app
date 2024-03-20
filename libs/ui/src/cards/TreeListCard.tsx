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
import { Tree } from '@hatsprotocol/sdk-v1-subgraph';
import { useHatDetailsField } from 'hats-hooks';
import { decimalId } from 'hats-utils';
import { useMediaStyles } from 'hooks';
import { HatIcon } from 'icons';
import _ from 'lodash';
import { BsPeopleFill } from 'react-icons/bs';
import { AppHat } from 'types';
import { removeInactiveHatsAndDescendants } from 'utils';

import { ChakraNextLink } from '../atoms';

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
  const activeHats = removeInactiveHatsAndDescendants(tree?.hats);
  const activeWearers = _.size(_.uniq(_.flatten(_.map(activeHats, 'wearers'))));

  return (
    <ChakraNextLink
      href={`/trees/${_.get(tree, 'chainId')}/${decimalId(_.get(tree, 'id'))}`}
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
              w='90%'
              justify='left'
              align={{
                base: 'flex-start',
                sm: 'center',
              }}
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
              {/* TOP HAT INFO */}
              {isMobile ? (
                <Stack spacing={1} w='60%' pt={2}>
                  <Text>{decimalId(_.get(tree, 'id'))}</Text>
                  <Heading size='md' noOfLines={2}>
                    {hatName}
                  </Heading>
                </Stack>
              ) : (
                <Stack spacing={1} maxW='110px' pt={0}>
                  <Heading size='md' noOfLines={2}>
                    {hatName}
                  </Heading>
                  <Text>Tree ID: {decimalId(_.get(tree, 'id'))}</Text>
                </Stack>
              )}
            </HStack>
            {/* TREE STATS */}
            <Stack w='12%' justify='center' align='end' h='100%' pr={4}>
              <HStack spacing={1} color='blue.700'>
                <Icon as={HatIcon} boxSize={3} />
                <Text size='xs' fontWeight='medium'>
                  {_.size(activeHats)}
                </Text>
              </HStack>
              <HStack spacing={1} color='blue.700'>
                <Icon as={BsPeopleFill} boxSize={3} />
                <Text size='xs' fontWeight='medium'>
                  {activeWearers}
                </Text>
              </HStack>
            </Stack>
          </Flex>
        </CardBody>
      </Card>
    </ChakraNextLink>
  );
};

export default TreeListCard;
