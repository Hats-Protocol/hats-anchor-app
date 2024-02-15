import {
  Box,
  Card,
  CardBody,
  Heading,
  HStack,
  Stack,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react';
import { Tree } from '@hatsprotocol/sdk-v1-subgraph';
import { useHatDetailsField } from 'hats-hooks';
import { AppHat } from 'hats-types';
import { decimalId } from 'hats-utils';
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
  const isMobile = useBreakpointValue({ base: true, sm: false });

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
          display='flex'
          alignItems='center'
          justifyContent='center'
          flexDirection='column'
        >
          <HStack
            h={{ base: 85, sm: '100px' }}
            w='100%'
            justify='left'
            align='center'
            spacing='16px'
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
              border='1px solid'
              borderColor='gray.200'
            />
            <Stack spacing={1} maxW='110px'>
              <Heading size='md' noOfLines={2}>
                {hatName}
              </Heading>
              <Text>Tree ID: {decimalId(_.get(tree, 'id'))}</Text>
            </Stack>
          </HStack>
        </CardBody>
      </Card>
    </ChakraNextLink>
  );
};

export default TreeListCard;
