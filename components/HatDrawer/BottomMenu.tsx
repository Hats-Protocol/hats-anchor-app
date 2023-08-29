import { Box, Button, Flex, HStack } from '@chakra-ui/react';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import {
  FaRegArrowAltCircleDown,
  FaRegArrowAltCircleLeft,
  FaRegArrowAltCircleRight,
  FaRegArrowAltCircleUp,
} from 'react-icons/fa';

import { useTreeForm } from '@/contexts/TreeFormContext';
import { createHierarchy } from '@/lib/hats';
import { Hierarchy, IHat } from '@/types';

const BottomMenu = () => {
  const { orgChartTree, selectedHat, setSelectedHatId } = useTreeForm();
  const [hierarchy, setHierarchy] = useState<Hierarchy>();

  useEffect(() => {
    if (orgChartTree) {
      const parentsAndIds = _.map(orgChartTree, (hat: IHat) => ({
        id: hat.id,
        parentId: hat.admin?.id,
      }));

      const hierarchyData = createHierarchy(parentsAndIds, selectedHat?.id);
      setHierarchy(hierarchyData);
    }
  }, [orgChartTree, selectedHat?.id]);

  return (
    <Box
      w='100%'
      position='absolute'
      bottom={0}
      zIndex={14}
      bg='whiteAlpha.900'
    >
      <Flex
        justify='space-between'
        p={4}
        borderTop='1px solid'
        borderColor='gray.200'
      >
        {hierarchy?.leftSibling ? (
          <Button
            variant='outline'
            onClick={() => setSelectedHatId?.(hierarchy?.leftSibling)}
            gap={1}
          >
            <FaRegArrowAltCircleLeft />
            {hatIdDecimalToIp(BigInt(hierarchy?.leftSibling))}
          </Button>
        ) : (
          <Box w={16} />
        )}

        <HStack>
          {hierarchy?.parentId ? (
            <Button
              variant='outline'
              onClick={() => setSelectedHatId?.(hierarchy?.parentId)}
              gap={1}
            >
              <FaRegArrowAltCircleUp />
              {hatIdDecimalToIp(BigInt(hierarchy?.parentId))}
            </Button>
          ) : (
            <Box w={16} />
          )}

          {hierarchy?.firstChild ? (
            <Button
              variant='outline'
              onClick={() => setSelectedHatId?.(hierarchy?.firstChild)}
              gap={1}
            >
              {hatIdDecimalToIp(BigInt(hierarchy?.firstChild))}
              <FaRegArrowAltCircleDown />
            </Button>
          ) : (
            <Box w={16} />
          )}
        </HStack>

        {hierarchy?.rightSibling ? (
          <Button
            variant='outline'
            onClick={() => setSelectedHatId?.(hierarchy?.rightSibling)}
            gap={1}
          >
            {hatIdDecimalToIp(BigInt(hierarchy?.rightSibling))}
            <FaRegArrowAltCircleRight />
          </Button>
        ) : (
          <Box w={16} />
        )}
      </Flex>
    </Box>
  );
};

export default BottomMenu;
