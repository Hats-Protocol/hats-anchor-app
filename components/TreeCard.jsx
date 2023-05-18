import _ from 'lodash';
import {
  CardBody,
  Link as ChakraLink,
  Card,
  Text,
  Stack,
  HStack,
  Box,
} from '@chakra-ui/react';
import Link from 'next/link';
import { decimalId } from '@/lib/hats';
import useHatDetailsField from '@/hooks/useHatDetailsField';

const TreeCard = ({ tree, imagesData }) => {
  const topHat = _.get(tree, 'hats[0]');
  const { data: hatDetailsFieldData, schemaType: schemaTypeDetailsField } =
    useHatDetailsField(_.get(topHat, 'details'));

  const hatName =
    schemaTypeDetailsField === '1.0'
      ? _.get(hatDetailsFieldData, 'name')
      : _.get(topHat, 'details');

  return (
    <ChakraLink
      as={Link}
      href={`/trees/${_.get(tree, 'chainId')}/${decimalId(
        _.get(tree, 'id'),
      )}/${decimalId(_.get(tree, 'hats[0].prettyId'))}`}
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
                imagesData[topHat.id]
                  ? `url('${imagesData[topHat.id]}')`
                  : `url('/icon.jpeg')`
              }
              bgSize='cover'
              bgPosition='center'
              alt='Top Hat image'
              w='85px'
              h='85px'
              border='1px solid'
              borderColor='gray.200'
            />
            <Stack spacing={1} maxW='110px'>
              <Text fontWeight={700} noOfLines={2}>
                {hatName}
              </Text>
              <Text>Tree ID: {decimalId(_.get(tree, 'id'))}</Text>
            </Stack>
          </HStack>
        </CardBody>
      </Card>
    </ChakraLink>
  );
};

export default TreeCard;
