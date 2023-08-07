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

import { createHierarchy } from '@/lib/hats';
import { HierarchyObject, IHat } from '@/types';

const BottomMenu = ({
  hatsData,
  selectedHatId,
  setSelectedHatId,
}: BottomMenuProps) => {
  const [currentHat, setCurrentHat] = useState<any>({});
  const [hierarchyData, setHierarchyData] = useState<HierarchyObject[]>();

  useEffect(() => {
    if (hatsData) {
      const parentsAndIds = hatsData.map((hat: IHat) => ({
        id: hat.id,
        parentId: hat.admin.id,
      }));

      const hierarchy = createHierarchy(parentsAndIds);
      setHierarchyData(hierarchy);
    }
  }, [hatsData]);

  useEffect(() => {
    if (selectedHatId && hierarchyData) {
      const hat = _.find(hierarchyData, ['id', selectedHatId]);
      if (hat) setCurrentHat(hat);
    }
  }, [selectedHatId, hierarchyData]);

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
        {currentHat?.leftSibling ? (
          <Button
            variant='outline'
            onClick={() => setSelectedHatId(currentHat?.leftSibling)}
            gap={1}
          >
            <FaRegArrowAltCircleLeft />
            {hatIdDecimalToIp(BigInt(currentHat?.leftSibling))}
          </Button>
        ) : (
          <Box w={16} />
        )}

        <HStack>
          {currentHat?.parentId ? (
            <Button
              variant='outline'
              onClick={() => setSelectedHatId(currentHat?.parentId)}
              gap={1}
            >
              <FaRegArrowAltCircleUp />
              {hatIdDecimalToIp(BigInt(currentHat?.parentId))}
            </Button>
          ) : (
            <Box w={16} />
          )}

          {currentHat?.firstChild ? (
            <Button
              variant='outline'
              onClick={() => setSelectedHatId(currentHat?.firstChild)}
              gap={1}
            >
              {hatIdDecimalToIp(BigInt(currentHat?.firstChild))}
              <FaRegArrowAltCircleDown />
            </Button>
          ) : (
            <Box w={16} />
          )}
        </HStack>

        {currentHat?.rightSibling ? (
          <Button
            variant='outline'
            onClick={() => setSelectedHatId(currentHat?.rightSibling)}
            gap={1}
          >
            {hatIdDecimalToIp(BigInt(currentHat?.rightSibling))}
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

interface BottomMenuProps {
  hatsData: IHat[] | undefined;
  selectedHatId?: string;
  setSelectedHatId: (id: string) => void;
}
