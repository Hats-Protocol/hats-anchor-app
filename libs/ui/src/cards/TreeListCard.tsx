import {
  Box,
  Card,
  CardBody,
  Heading,
  HStack,
  Stack,
  Text,
} from '@chakra-ui/react';
import { Tree } from '@hatsprotocol/sdk-v1-subgraph';
import { useHatDetailsField } from 'hats-hooks';
import { AppHat } from 'hats-types';
import { decimalId } from 'hats-utils';
import { useMediaStyles } from 'hooks';
import _ from 'lodash';

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
          <HStack
            h={{ base: 85, sm: '100px' }}
            w='100%'
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
            {isMobile ? (
              <Stack spacing={1} maxW='110px' pt={isMobile ? 2 : 0}>
                <Text>{decimalId(_.get(tree, 'id'))}</Text>
                <Heading size='md' noOfLines={2}>
                  {hatName}
                </Heading>
              </Stack>
            ) : (
              <Stack
                spacing={1}
                maxW={{
                  base: 'auto',
                  sm: '110px',
                }}
                pt={isMobile ? 2 : 0}
              >
                <Heading size='md' noOfLines={2}>
                  {hatName}
                </Heading>
                <Text>Tree ID: {decimalId(_.get(tree, 'id'))}</Text>
              </Stack>
            )}
          </HStack>
        </CardBody>
      </Card>
    </ChakraNextLink>
  );
};

export default TreeListCard;
