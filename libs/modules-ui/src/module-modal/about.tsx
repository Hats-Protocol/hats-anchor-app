import { Flex, Heading, HStack, Icon, Stack, Text } from '@chakra-ui/react';
import { hatIdDecimalToIp, hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { map } from 'lodash';
import dynamic from 'next/dynamic';
import { ReactNode } from 'react';
import { IconType } from 'react-icons';
import { Hex } from 'viem';

const HatIcon = dynamic(() => import('icons').then((mod) => mod.HatIcon));

// TODO must include hatId or descriptor
interface ModuleDescriptor {
  label?: string;
  hatId?: Hex;
  icon?: IconType;
  descriptor?: ReactNode;
}

// TODO handle loading skeletons

export const AboutModule = ({
  heading,
  moduleDescriptors,
}: {
  heading: string;
  moduleDescriptors: ModuleDescriptor[];
}) => {
  return (
    <Stack>
      <Heading size='sm'>{heading}</Heading>

      {map(moduleDescriptors, ({ label, hatId, icon, descriptor }) => {
        if (descriptor) {
          return (
            <Flex key={label} justify='space-between'>
              <Text size='sm'>{label}</Text>

              {descriptor}
            </Flex>
          );
        }

        if (!hatId) return null;

        return (
          <Flex key={label} justify='space-between'>
            <Text size='sm'>{label}</Text>

            <HStack spacing={1}>
              <Text size='sm'>
                {hatIdDecimalToIp(hatIdHexToDecimal(hatId))}
              </Text>
              <Icon as={icon || HatIcon} boxSize={4} />
            </HStack>
          </Flex>
        );
      })}
    </Stack>
  );
};
