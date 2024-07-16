'use client';

import {
  Card,
  CardBody,
  Flex,
  Heading,
  HStack,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useTreasury } from 'contexts';
import { get } from 'lodash';

const TreeOverview = () => {
  const { treeDetails } = useTreasury();
  const topHatDetails = get(treeDetails, 'hats[0].detailsMetadata');
  const topHatName = topHatDetails
    ? get(JSON.parse(topHatDetails), 'data.name')
    : get(treeDetails, 'hats[0].details');

  return (
    <Flex justify='center'>
      <Card minW='400px'>
        <CardBody>
          <Stack justifyContent='center'>
            <HStack>
              <Heading textAlign='center'>{topHatName}</Heading>
            </HStack>
            <Text textAlign='center' fontStyle='italic'>
              Roles with budgets
            </Text>
          </Stack>
        </CardBody>
      </Card>
    </Flex>
  );
};

export default TreeOverview;
