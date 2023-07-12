import { Box, Button, Flex, HStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import {
  FaRegArrowAltCircleDown,
  FaRegArrowAltCircleLeft,
  FaRegArrowAltCircleRight,
  FaRegArrowAltCircleUp,
} from 'react-icons/fa';

import { prettyIdToIp } from '@/lib/hats';
import { HierarchyObject } from '@/types';

const BottomMenu = ({
  selectedHatId,
  setSelectedHatId,
  hierarchyData,
}: BottomMenuProps) => {
  const [currentHat, setCurrentHat] = useState<any>({});

  useEffect(() => {
    if (selectedHatId) {
      const hat = hierarchyData.find((h) => h.id === selectedHatId);
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
            {prettyIdToIp(currentHat?.leftSibling)}
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
              {prettyIdToIp(currentHat?.parentId)}
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
              {prettyIdToIp(currentHat?.firstChild)}
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
            {prettyIdToIp(currentHat?.rightSibling)}
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
  hierarchyData: HierarchyObject[];
}
