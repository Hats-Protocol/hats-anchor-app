/* eslint-disable no-shadow */
import React, { useEffect, useState } from 'react';
import { Box, Flex, HStack, Button } from '@chakra-ui/react';
import {
  FaRegArrowAltCircleDown,
  FaRegArrowAltCircleLeft,
  FaRegArrowAltCircleRight,
  FaRegArrowAltCircleUp,
} from 'react-icons/fa';

import { prettyIdToId, prettyIdToIp } from '@/lib/hats';

const BottomMenu = ({
  selectedHatId,
  setSelectedHatId,
  hatsData,
}: BottomMenuProps) => {
  const [hierarchyHatData, setHierarchyHatData] = useState<any>({});

  useEffect(() => {
    if (selectedHatId) {
      const hierarchyData = hatsData[prettyIdToId(selectedHatId)];
      setHierarchyHatData(hierarchyData);
    }
  }, [selectedHatId, hatsData]);

  return (
    <Box w='100%' position='absolute' bottom={0} zIndex={14}>
      <Flex
        justify='space-between'
        p={4}
        borderTop='1px solid'
        borderColor='gray.200'
      >
        {hierarchyHatData?.leftSibling ? (
          <Button
            variant='outline'
            onClick={() => setSelectedHatId(hierarchyHatData?.leftSibling)}
            gap={1}
          >
            <FaRegArrowAltCircleLeft />
            {prettyIdToIp(hierarchyHatData?.leftSibling)}
          </Button>
        ) : (
          <Box w={16} />
        )}

        <HStack>
          {hierarchyHatData?.parentId ? (
            <Button
              variant='outline'
              onClick={() => setSelectedHatId(hierarchyHatData?.parentId)}
              gap={1}
            >
              <FaRegArrowAltCircleUp />
              {prettyIdToIp(hierarchyHatData?.parentId)}
            </Button>
          ) : (
            <Box w={16} />
          )}

          {hierarchyHatData?.firstChild ? (
            <Button
              variant='outline'
              onClick={() => setSelectedHatId(hierarchyHatData?.firstChild)}
              gap={1}
            >
              {prettyIdToIp(hierarchyHatData?.firstChild)}
              <FaRegArrowAltCircleDown />
            </Button>
          ) : (
            <Box w={16} />
          )}
        </HStack>

        {hierarchyHatData?.rightSibling ? (
          <Button
            variant='outline'
            onClick={() => setSelectedHatId(hierarchyHatData?.rightSibling)}
            gap={1}
          >
            {prettyIdToIp(hierarchyHatData?.rightSibling)}
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
  selectedHatId?: string;
  setSelectedHatId: (id: string) => void;
  hatsData: any;
}
