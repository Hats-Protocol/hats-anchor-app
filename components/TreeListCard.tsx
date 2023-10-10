import { Box, Card, CardBody, HStack, Stack, Text } from '@chakra-ui/react';
import _ from 'lodash';

import ChakraNextLink from '@/components/atoms/ChakraNextLink';
import useHatDetailsField from '@/hooks/useHatDetailsField';
import { decimalId } from '@/lib/hats';
import { Hat, Tree } from '@/types';

const TreeListCard = ({
  tree,
  topHat,
  topHatImage,
}: {
  tree: Tree;
  topHat: Hat;
  topHatImage: Hat | undefined;
}) => {
  const { data: hatDetails } = useHatDetailsField(_.get(topHat, 'details'));

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
        <CardBody>
          <HStack
            h='100px'
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
              <Text fontWeight='bold' noOfLines={2}>
                {hatName}
              </Text>
              <Text>Tree ID: {decimalId(_.get(tree, 'id'))}</Text>
            </Stack>
          </HStack>
        </CardBody>
      </Card>
    </ChakraNextLink>
  );
};

export default TreeListCard;
