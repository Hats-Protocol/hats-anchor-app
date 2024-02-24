import { Box, Button, Flex, HStack } from '@chakra-ui/react';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useTreeForm } from 'contexts';
import { useMediaStyles } from 'hooks';
import {
  FaRegArrowAltCircleDown,
  FaRegArrowAltCircleLeft,
  FaRegArrowAltCircleRight,
  FaRegArrowAltCircleUp,
} from 'react-icons/fa';

import MobileBottomMenu from './mobile';

const BottomMenu = ({ show }: { show?: boolean }) => {
  const { setSelectedHatId, hierarchy } = useTreeForm();
  const { isMobile } = useMediaStyles();

  if (isMobile) {
    return <MobileBottomMenu show={show} />;
  }

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
