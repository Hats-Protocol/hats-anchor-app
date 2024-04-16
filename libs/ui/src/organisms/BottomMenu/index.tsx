import { Box, Button, Flex, HStack, Icon, Text } from '@chakra-ui/react';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useSelectedHat, useTreeForm } from 'contexts';
import { useMediaStyles } from 'hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { getQueryRoute } from 'utils';

import MobileBottomMenu from './mobile';

const BoxArrowDown = dynamic(() =>
  import('react-icons/pi').then((i) => i.PiArrowSquareRight),
);
const BoxArrowLeft = dynamic(() =>
  import('react-icons/pi').then((i) => i.PiArrowSquareLeft),
);
const BoxArrowRight = dynamic(() =>
  import('react-icons/pi').then((i) => i.PiArrowSquareRight),
);
const BoxArrowUp = dynamic(() =>
  import('react-icons/pi').then((i) => i.PiArrowSquareUp),
);

const BottomMenu = ({ show }: { show?: boolean }) => {
  const { treeId } = useTreeForm();
  const { hierarchy } = useSelectedHat();
  const { isMobile } = useMediaStyles();
  const router = useRouter();

  if (isMobile) {
    return <MobileBottomMenu show={show} />;
  }

  const selectHat = (name: string) => {
    const newHatId = _.get(hierarchy, name);
    const updatedUrl = getQueryRoute({
      query: router.query,
      pathname: router.pathname,
      hat: newHatId,
      treeId,
    });
    router.push(updatedUrl, undefined, { shallow: true });
  };

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
            onClick={() => selectHat('leftSibling')}
            leftIcon={<Icon as={BoxArrowLeft} boxSize={5} />}
          >
            <Text variant='medium'>
              {hatIdDecimalToIp(BigInt(hierarchy?.leftSibling))}
            </Text>
          </Button>
        ) : (
          <Box w={16} />
        )}

        <HStack>
          {hierarchy?.parentId ? (
            <Button
              variant='outline'
              onClick={() => selectHat('parentId')}
              leftIcon={<Icon as={BoxArrowUp} boxSize={5} />}
            >
              <Text variant='medium'>
                {hatIdDecimalToIp(BigInt(hierarchy?.parentId))}
              </Text>
            </Button>
          ) : (
            <Box w={16} />
          )}

          {hierarchy?.firstChild ? (
            <Button
              variant='outline'
              onClick={() => selectHat('firstChild')}
              rightIcon={<Icon as={BoxArrowDown} boxSize={5} />}
            >
              <Text variant='medium'>
                {hatIdDecimalToIp(BigInt(hierarchy?.firstChild))}
              </Text>
            </Button>
          ) : (
            <Box w={16} />
          )}
        </HStack>

        {hierarchy?.rightSibling ? (
          <Button
            variant='outline'
            onClick={() => selectHat('rightSibling')}
            rightIcon={<Icon as={BoxArrowRight} boxSize={5} />}
          >
            <Text variant='medium'>
              {hatIdDecimalToIp(BigInt(hierarchy?.rightSibling))}
            </Text>
          </Button>
        ) : (
          <Box w={16} />
        )}
      </Flex>
    </Box>
  );
};

export default BottomMenu;
