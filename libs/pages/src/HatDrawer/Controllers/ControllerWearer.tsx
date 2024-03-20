import { HStack, Icon, Text } from '@chakra-ui/react';
import { FALLBACK_ADDRESS } from '@hatsprotocol/sdk-v1-core';
import dynamic from 'next/dynamic';
import { Hex } from 'viem';

const WearerIcon = dynamic(() => import('icons').then((i) => i.WearerIcon));
const EmptyWearer = dynamic(() => import('icons').then((i) => i.EmptyWearer));

const ControllerWearer = ({
  address,
  name,
}: {
  address: Hex;
  name: string;
}) => {
  if (address === FALLBACK_ADDRESS) {
    return (
      <HStack color='blackAlpha.600' spacing={1}>
        <Text>Null</Text>
        <Icon as={EmptyWearer} />
      </HStack>
    );
  }

  return (
    <HStack color='Informative-Human' spacing={1}>
      <Text>{name}</Text>
      <Icon as={WearerIcon} />
    </HStack>
  );
};

export default ControllerWearer;
