'use client';

import { HStack, Icon, Text, Tooltip } from '@chakra-ui/react';
import { NULL_ADDRESSES } from '@hatsprotocol/constants';
import { useSelectedHat } from 'contexts';
import { getControllerNameAndLink } from 'hats-utils';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { ControllerData } from 'types';
import { formatAddress } from 'utils';

const CodeIcon = dynamic(() => import('icons').then((i) => i.CodeIcon));
const WearerIcon = dynamic(() => import('icons').then((i) => i.WearerIcon));
const EmptyWearer = dynamic(() => import('icons').then((i) => i.EmptyWearer));
const ChakraNextLink = dynamic(() =>
  import('ui').then((mod) => mod.ChakraNextLink),
);

export const ControllerWearer = ({
  controllerData,
}: {
  controllerData: ControllerData | undefined;
}) => {
  const { chainId } = useSelectedHat();
  const { id: address, isContract } = _.pick(controllerData, [
    'id',
    'isContract',
    'ensName',
  ]);

  const { name, link, icon } = getControllerNameAndLink({
    extendedController: controllerData,
    chainId,
  });

  if (_.includes(NULL_ADDRESSES, address)) {
    return (
      <HStack color='blackAlpha.600' spacing={1}>
        <Text>Null</Text>
        <Icon as={EmptyWearer} boxSize={4} />
      </HStack>
    );
  }

  return (
    <ChakraNextLink href={link}>
      <Tooltip
        label={name !== formatAddress(address) && address}
        placement='left'
        minW='380px'
        hasArrow
      >
        <HStack
          color={
            !isContract || name?.includes('Safe')
              ? 'Informative-Human'
              : 'Informative-Code'
          }
          spacing={1}
        >
          <Text>{name}</Text>
          <Icon as={icon ?? (isContract ? CodeIcon : WearerIcon)} boxSize={4} />
        </HStack>
      </Tooltip>
    </ChakraNextLink>
  );
};
